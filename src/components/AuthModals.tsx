import React, { useState } from 'react';
import { X, Heart, Sparkles, UserCheck, KeyRound, Mail, ArrowRight, Check, Leaf } from 'lucide-react';
import { apiClient } from '../api/client';
import { Household, UserAccount } from '../types';
import { AVATAR_OPTIONS, Avatar } from './Avatar';

interface AuthModalsProps {
  mode: 'login' | 'register' | 'join' | null;
  onClose: () => void;
  onSuccess: (user: UserAccount, household: Household) => void;
}

const COLOR_OPTIONS = ['#5B8296', '#D4A373', '#7E9F7A', '#A26A42', '#8C6344', '#4E684C'];

export const AuthModals: React.FC<AuthModalsProps> = ({ mode, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partner1Name, setPartner1Name] = useState('Alex');
  const [partner1Avatar, setPartner1Avatar] = useState('botanical_leaf');
  const [partner1Color, setPartner1Color] = useState('#5B8296');

  const [partner2Name, setPartner2Name] = useState('Jordan');
  const [partner2Avatar, setPartner2Avatar] = useState('hearth_flame');
  const [partner2Color, setPartner2Color] = useState('#A26A42');

  const [inviteCode, setInviteCode] = useState('');
  const [joinPartnerRole, setJoinPartnerRole] = useState<'partner1' | 'partner2'>('partner2');
  const [joinName, setJoinName] = useState('');

  const [loginPartnerRole, setLoginPartnerRole] = useState<'partner1' | 'partner2'>('partner1');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mode) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.login(email, password, loginPartnerRole);
      onSuccess(res.user, res.household);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.register({
        email,
        password,
        householdName: `${partner1Name} & ${partner2Name}’s Home`,
        partner1Name,
        partner1Emoji: partner1Avatar,
        partner1Color,
        partner2Name,
        partner2Emoji: partner2Avatar,
        partner2Color,
      });
      onSuccess(res.user, res.household);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.joinHousehold({
        inviteCode,
        partnerRole: joinPartnerRole,
        name: joinName,
        email: email || `${joinName.toLowerCase().replace(/\s+/g, '')}@partner.local`,
        password: password || 'joined-pass',
      });
      onSuccess(res.user, res.household);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not find household with this code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0D120D]">
      <div className="bg-[#161F16] border border-[#2F3E2F] text-[#E8EFE6] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C3B2C] flex items-center justify-between bg-[#121912]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#243324] text-[#8EA38A] flex items-center justify-center border border-[#3C523C]">
              {mode === 'login' && <KeyRound className="w-4 h-4" />}
              {mode === 'register' && <Leaf className="w-4 h-4" />}
              {mode === 'join' && <UserCheck className="w-4 h-4" />}
            </div>
            <h2 className="text-base font-serif font-bold text-[#F4F8F3]">
              {mode === 'login' && 'Sign In to Your Budget'}
              {mode === 'register' && 'Create Couple Account'}
              {mode === 'join' && 'Join Existing Household'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8EA38A] hover:text-[#F4F8F3] hover:bg-[#202B20] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#341F1F] border border-[#633333] text-[#F4D0D0] text-xs">
              {error}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8EA38A] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full bg-[#121812] border border-[#2B3C2B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F8F3] outline-none focus:border-[#8EA38A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8EA38A] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#121812] border border-[#2B3C2B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F8F3] outline-none focus:border-[#8EA38A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8EA38A] mb-1.5">Active Partner Profile</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginPartnerRole('partner1')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      loginPartnerRole === 'partner1'
                        ? 'bg-[#223122] border-[#4E684C] text-[#F4F8F3]'
                        : 'bg-[#121812] border-[#253425] text-[#8EA38A]'
                    }`}
                  >
                    Partner 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginPartnerRole('partner2')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      loginPartnerRole === 'partner2'
                        ? 'bg-[#223122] border-[#4E684C] text-[#F4F8F3]'
                        : 'bg-[#121812] border-[#253425] text-[#8EA38A]'
                    }`}
                  >
                    Partner 2
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#4E684C] hover:bg-[#5D7B5B] disabled:bg-[#273727] disabled:text-[#688166] text-xs font-bold text-[#F4F8F3] transition shadow-md"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8EA38A] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="couple@example.com"
                  required
                  className="w-full bg-[#121812] border border-[#2B3C2B] rounded-xl px-3.5 py-2 text-xs text-[#F4F8F3] outline-none focus:border-[#8EA38A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8EA38A] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#121812] border border-[#2B3C2B] rounded-xl px-3.5 py-2 text-xs text-[#F4F8F3] outline-none focus:border-[#8EA38A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8EA38A]">Partner 1 Name</label>
                  <input
                    type="text"
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    className="w-full bg-[#121812] border border-[#2B3C2B] rounded-xl px-3 py-1.5 text-xs text-[#F4F8F3] font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8EA38A]">Partner 2 Name</label>
                  <input
                    type="text"
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    className="w-full bg-[#121812] border border-[#2B3C2B] rounded-xl px-3 py-1.5 text-xs text-[#F4F8F3] font-bold outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#4E684C] hover:bg-[#5D7B5B] disabled:bg-[#273727] disabled:text-[#688166] text-xs font-bold text-[#F4F8F3] transition shadow-md"
              >
                {loading ? 'Creating Household...' : 'Create Household Account'}
              </button>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8EA38A] mb-1">Partner Sync Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DUO-8492"
                  required
                  className="w-full bg-[#121812] border border-[#2B3C2B] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#D4A373] outline-none focus:border-[#8EA38A] uppercase tracking-widest text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8EA38A] mb-1">Your Name</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full bg-[#121812] border border-[#2B3C2B] rounded-xl px-3.5 py-2 text-xs text-[#F4F8F3] outline-none focus:border-[#8EA38A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8EA38A] mb-1.5">Join As Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinPartnerRole('partner2')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      joinPartnerRole === 'partner2'
                        ? 'bg-[#223122] border-[#4E684C] text-[#F4F8F3]'
                        : 'bg-[#121812] border-[#253425] text-[#8EA38A]'
                    }`}
                  >
                    Partner 2 (Co-Partner)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinPartnerRole('partner1')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      joinPartnerRole === 'partner1'
                        ? 'bg-[#223122] border-[#4E684C] text-[#F4F8F3]'
                        : 'bg-[#121812] border-[#253425] text-[#8EA38A]'
                    }`}
                  >
                    Partner 1
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#4E684C] hover:bg-[#5D7B5B] disabled:bg-[#273727] disabled:text-[#688166] text-xs font-bold text-[#F4F8F3] transition shadow-md"
              >
                {loading ? 'Joining Household...' : 'Join Household'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
