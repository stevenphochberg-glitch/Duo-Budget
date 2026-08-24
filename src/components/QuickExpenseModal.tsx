import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  Sparkles,
  Home,
  Landmark,
  DollarSign,
  Tag,
  Smile,
  Edit2,
  Info,
  ShieldCheck,
  Heart,
  ThumbsUp,
  Star,
  Coffee,
  Leaf,
  Shield,
  Flame,
  Check,
} from 'lucide-react';
import {
  Household,
  MainCategoryKey,
  Partner,
  SubcategoryConfig,
  Transaction,
} from '../types';
import { Avatar } from './Avatar';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  activePartner: Partner;
  subcategories: SubcategoryConfig[];
  currency: string;
  defaultCategory?: MainCategoryKey;
  defaultSubcategoryId?: string;
  editingTransaction?: Transaction | null;
  onSaveExpense: (data: any) => Promise<void>;
}

const VECTOR_REACTIONS = [
  { id: 'heart', label: 'Love', icon: <Heart className="w-4 h-4 text-[#E58080]" /> },
  { id: 'star', label: 'Star', icon: <Star className="w-4 h-4 text-[#D4A373]" /> },
  { id: 'thumbs_up', label: 'Great', icon: <ThumbsUp className="w-4 h-4 text-[#84BA80]" /> },
  { id: 'coffee', label: 'Coffee', icon: <Coffee className="w-4 h-4 text-[#D4A373]" /> },
  { id: 'sparkles', label: 'Sparkle', icon: <Sparkles className="w-4 h-4 text-[#7FA1B3]" /> },
  { id: 'leaf', label: 'Sage', icon: <Leaf className="w-4 h-4 text-[#84BA80]" /> },
  { id: 'shield', label: 'Safe', icon: <Shield className="w-4 h-4 text-[#7FA1B3]" /> },
  { id: 'flame', label: 'Fire', icon: <Flame className="w-4 h-4 text-[#D4A373]" /> },
];

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  household,
  activePartner,
  subcategories,
  currency,
  defaultCategory = 'required',
  defaultSubcategoryId,
  editingTransaction,
  onSaveExpense,
}) => {
  const [amount, setAmount] = useState('');
  const [mainCategory, setMainCategory] = useState<MainCategoryKey>(defaultCategory);
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string>(activePartner.id);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [initialReaction, setInitialReaction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { settings } = household;

  // Filter out FIXED categories: only variable and hybrid allow manual logging
  const loggableSubcategories = subcategories.filter((s) => s.spendingType !== 'fixed');

  useEffect(() => {
    if (editingTransaction) {
      setAmount(String(editingTransaction.amount));
      setMainCategory(editingTransaction.mainCategory);
      setSubcategoryId(editingTransaction.subcategoryId || '');
      setPartnerId(editingTransaction.partnerId);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
    } else {
      setAmount('');
      setMainCategory(defaultCategory);
      setPartnerId(activePartner.id);
      setDate(new Date().toISOString().slice(0, 10));
      setNote('');
      setInitialReaction(null);

      // Default subcategory (must be loggable)
      if (defaultSubcategoryId) {
        const matchingSub = subcategories.find((s) => s.id === defaultSubcategoryId);
        if (matchingSub && matchingSub.spendingType !== 'fixed') {
          setSubcategoryId(defaultSubcategoryId);
        } else {
          const available = loggableSubcategories.filter((s) => s.mainCategory === defaultCategory);
          if (available.length > 0) setSubcategoryId(available[0].id);
          else setSubcategoryId('');
        }
      } else {
        const available = loggableSubcategories.filter((s) => s.mainCategory === defaultCategory);
        if (available.length > 0) setSubcategoryId(available[0].id);
        else setSubcategoryId('');
      }
    }
  }, [isOpen, editingTransaction, defaultCategory, defaultSubcategoryId, activePartner, subcategories]);

  // When main category changes, update subcategory options
  const handleMainCategoryChange = (cat: MainCategoryKey) => {
    setMainCategory(cat);
    const available = loggableSubcategories.filter((s) => s.mainCategory === cat);
    if (available.length > 0) {
      setSubcategoryId(available[0].id);
    } else {
      setSubcategoryId('');
    }
  };

  if (!isOpen) return null;

  const currentAvailableSubs = loggableSubcategories.filter((s) => s.mainCategory === mainCategory);
  const selectedSub = loggableSubcategories.find((s) => s.id === subcategoryId);

  const handleQuickAddAmount = (addVal: number) => {
    const current = Number(amount) || 0;
    setAmount(String((current + addVal).toFixed(2)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (mainCategory !== 'discretionary' && !selectedSub && currentAvailableSubs.length > 0) return;

    setIsSubmitting(true);
    try {
      const partnerObj = partnerId === 'partner1' ? settings.partner1 : settings.partner2;

      await onSaveExpense({
        id: editingTransaction ? editingTransaction.id : undefined,
        householdId: household.id,
        partnerId,
        partnerName: partnerObj.name,
        mainCategory,
        subcategoryId: selectedSub ? selectedSub.id : subcategoryId || 'custom_expense',
        subcategoryName: selectedSub ? selectedSub.name : 'Expense',
        amount: parsedAmount,
        date,
        note,
        spendingType: selectedSub?.spendingType || 'variable',
        isFixedBaseAllocation: false,
        initialReaction,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0D120D]">
      <div className="bg-[#161F16] border border-[#2F3E2F] text-[#E8EFE6] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C3B2C] flex items-center justify-between bg-[#121912]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#243324] border border-[#3C523C] text-[#8EA38A] flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#F4F8F3] tracking-wide">
                {editingTransaction ? 'Edit Logged Expense' : 'Log Household Expense'}
              </h2>
              <p className="text-xs text-[#8EA38A]">
                Record variable purchases and discretionary spending.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8EA38A] hover:text-[#F4F8F3] hover:bg-[#202B20] transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Amount Input with Large Tap Increments */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8EA38A] block">
              Expense Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-xl font-bold text-[#8EA38A]">{currency}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#121812] border border-[#2C3B2C] rounded-2xl pl-10 pr-4 py-3 text-2xl font-bold text-[#F4F8F3] outline-none focus:border-[#8EA38A] shadow-inner"
                autoFocus
                required
              />
            </div>

            {/* Quick Increment Buttons (Kitchen Tablet Friendly) */}
            <div className="flex items-center gap-2 pt-1">
              {[5, 10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="flex-1 py-1.5 rounded-xl bg-[#1B251B] hover:bg-[#263526] border border-[#2D3F2D] text-xs font-bold text-[#D4E0D2] transition"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Main Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8EA38A] block">Main Category Tier</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleMainCategoryChange('required')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  mainCategory === 'required'
                    ? 'bg-[#1E2C38] border-[#44627A] text-[#F4F8F3] shadow-sm'
                    : 'bg-[#141C14] border-[#253425] text-[#8EA38A] hover:text-[#D4E0D2]'
                }`}
              >
                <span>Required</span>
                <span className="text-[10px] text-[#9CB39A]">Bills & Groceries</span>
              </button>

              <button
                type="button"
                onClick={() => handleMainCategoryChange('discretionary')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  mainCategory === 'discretionary'
                    ? 'bg-[#2E241B] border-[#5E4734] text-[#F4F8F3] shadow-sm'
                    : 'bg-[#141C14] border-[#253425] text-[#8EA38A] hover:text-[#D4E0D2]'
                }`}
              >
                <span>Discretionary</span>
                <span className="text-[10px] text-[#C4A790]">Fun & Dining</span>
              </button>

              <button
                type="button"
                onClick={() => handleMainCategoryChange('reserved')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  mainCategory === 'reserved'
                    ? 'bg-[#202E20] border-[#3B543B] text-[#F4F8F3] shadow-sm'
                    : 'bg-[#141C14] border-[#253425] text-[#8EA38A] hover:text-[#D4E0D2]'
                }`}
              >
                <span>Reserve Fund</span>
                <span className="text-[10px] text-[#9CB39A]">Emergency & Sinking</span>
              </button>
            </div>
          </div>

          {/* Subcategory Selector */}
          {currentAvailableSubs.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8EA38A] block">Subcategory</label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full bg-[#141C14] border border-[#2B3C2B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A]"
              >
                {currentAvailableSubs.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({currency}{sub.targetMonthlyBudget}/mo)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Partner & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Who Paid */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8EA38A] block">Who Paid?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPartnerId('partner1')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    partnerId === 'partner1'
                      ? 'bg-[#223122] border-[#445E44] text-[#F4F8F3]'
                      : 'bg-[#141C14] border-[#253425] text-[#8EA38A]'
                  }`}
                >
                  <Avatar avatar={settings.partner1.avatarEmoji} color={settings.partner1.color || '#5B8296'} size="xs" />
                  <span>{settings.partner1.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPartnerId('partner2')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    partnerId === 'partner2'
                      ? 'bg-[#223122] border-[#445E44] text-[#F4F8F3]'
                      : 'bg-[#141C14] border-[#253425] text-[#8EA38A]'
                  }`}
                >
                  <Avatar avatar={settings.partner2.avatarEmoji} color={settings.partner2.color || '#A26A42'} size="xs" />
                  <span>{settings.partner2.name}</span>
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8EA38A] block">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#141C14] border border-[#2B3C2B] rounded-xl px-3 py-2 text-xs text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A]"
                />
              </div>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8EA38A] block">Note / Merchant (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Trader Joe's, Coffee with Sarah"
              className="w-full bg-[#141C14] border border-[#2B3C2B] rounded-xl px-3 py-2 text-xs text-[#F4F8F3] font-medium outline-none focus:border-[#8EA38A]"
            />
          </div>

          {/* Vector Reaction Stamp (Zero Emojis) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8EA38A] block">Initial Reaction Stamp (Optional)</label>
            <div className="flex items-center gap-2 overflow-x-auto p-1 bg-[#121812] rounded-xl border border-[#243124]">
              {VECTOR_REACTIONS.map((vr) => (
                <button
                  key={vr.id}
                  type="button"
                  onClick={() => setInitialReaction(initialReaction === vr.id ? null : vr.id)}
                  className={`p-2 rounded-lg border flex items-center gap-1.5 transition ${
                    initialReaction === vr.id
                      ? 'bg-[#273727] border-[#8EA38A] shadow-sm'
                      : 'bg-[#182118] border-[#243124] hover:bg-[#1F2B1F]'
                  }`}
                  title={vr.label}
                >
                  {vr.icon}
                  <span className="text-[10px] text-[#A8BEA4]">{vr.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#263526]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8EA38A] hover:text-[#F4F8F3] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !amount || Number(amount) <= 0}
              className="bg-[#4E684C] hover:bg-[#5D7B5B] disabled:bg-[#253425] disabled:text-[#688166] text-[#F4F8F3] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Save Changes' : 'Log Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
