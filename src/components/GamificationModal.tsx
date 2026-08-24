import React, { useState } from 'react';
import {
  X,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Dice5,
  History,
  Shield,
  HelpCircle,
  ArrowRight,
  Plus,
  Circle,
  Check,
  Zap,
  Lock,
  Gift,
  Sprout,
  Leaf,
  Trees,
  Sun,
  Mountain,
  Coins,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Household,
  MonthPeriodData,
  Partner,
  WeekGamble,
  WeekScoreRecord,
  NegativeSponge,
} from '../types';
import {
  resolveGambleOutcome,
} from '../utils/budgetCalculations';
import { ALL_BADGES, LEVEL_TIERS, calculateLevel, evaluateWeekGamification } from '../utils/gamification';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  activePartner: Partner;
  monthData: MonthPeriodData;
  selectedWeekNumber: number;
  currentWeekDiff: number; // positive = underspent, negative = overspent
  currentWeekTotalBudget: number;
  currentWeekTotalSpent: number;
  monthTotalBudget: number;
  monthTotalSpent: number;
  currency: string;
  onPlaceGamble: (data: {
    householdId: string;
    partnerId: string;
    weekNumber: number;
    monthKey: string;
    overspentAmount: number;
    gambleAmount: number;
    notes?: string;
  }) => Promise<void>;
  onResolveGamble: (
    householdId: string,
    gambleId: string,
    status: 'won' | 'lost',
    scoreImpact: number
  ) => Promise<void>;
  onRecordWeekScore: (weekRecord: WeekScoreRecord) => Promise<void>;
  onToggleTask: (spongeId: string, taskId: string) => Promise<void>;
  onCreateSponge?: (sponge: NegativeSponge) => Promise<void>;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  household,
  activePartner,
  monthData,
  selectedWeekNumber,
  currentWeekDiff,
  currentWeekTotalBudget,
  currentWeekTotalSpent,
  monthTotalBudget,
  monthTotalSpent,
  currency,
  onPlaceGamble,
  onResolveGamble,
  onRecordWeekScore,
  onToggleTask,
}) => {
  const [activeTab, setActiveTab] = useState<'levels_badges' | 'sponges' | 'gambles' | 'history' | 'rules'>('levels_badges');
  const [gambleAmountInput, setGambleAmountInput] = useState('');
  const [gambleNotes, setGambleNotes] = useState('');
  const [isSubmittingGamble, setIsSubmittingGamble] = useState(false);
  const [isEvaluatingWeek, setIsEvaluatingWeek] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  if (!isOpen) return null;

  const { score, gambles = [], sponges = [], unlockedBadgeIds = [] } = household;
  const totalPoints = score?.totalPoints || 0;
  const currentStreak = score?.currentStreakWeeks || 0;
  const levelInfo = calculateLevel(totalPoints);

  const isCurrentWeekOverspent = currentWeekDiff < 0;
  const overspentDeficit = Math.abs(currentWeekDiff);

  const activeGambles = gambles.filter((g) => g.status === 'active');
  const pastGambles = gambles.filter((g) => g.status !== 'active');

  const activeSponges = sponges.filter((s) => s.status === 'active');
  const expungedSponges = sponges.filter((s) => s.status === 'expunged');

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  const handleCreateGamble = async (e: React.FormEvent) => {
    e.preventDefault();
    const wager = Number(gambleAmountInput) || overspentDeficit;
    if (wager <= 0) return;

    setIsSubmittingGamble(true);
    setSuccessMsg(null);
    try {
      await onPlaceGamble({
        householdId: household.id,
        partnerId: activePartner.id,
        weekNumber: selectedWeekNumber,
        monthKey: monthData.monthKey,
        overspentAmount: overspentDeficit,
        gambleAmount: wager,
        notes: gambleNotes || `Betting to recoup ${currency}${wager} week ${selectedWeekNumber} overage by month end!`,
      });
      setGambleAmountInput('');
      setGambleNotes('');
      setSuccessMsg('Gamble placed! Track your savings to win back bonus score points.');
      triggerConfetti();
    } finally {
      setIsSubmittingGamble(false);
    }
  };

  const handleTaskClick = async (spongeId: string, taskId: string) => {
    setTogglingTaskId(taskId);
    try {
      await onToggleTask(spongeId, taskId);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-[#84BA80]" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5 text-[#84BA80]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#D4A373]" />;
      case 'Award':
      case 'Trophy':
        return <Award className="w-5 h-5 text-[#D4A373]" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-[#D4A373]" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-[#60935D]" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-[#D4A373]" />;
      case 'Coins':
      case 'Dices':
        return <Coins className="w-5 h-5 text-[#7FA1B3]" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-[#7FA1B3]" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-[#8EA38A]" />;
      default:
        return <Award className="w-5 h-5 text-[#8EA38A]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0D120D]">
      <div className="bg-[#161F16] border border-[#2F3E2F] text-[#E8EFE6] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C3B2C] flex items-center justify-between bg-[#121912]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#243324] border border-[#3C523C] text-[#D4A373] flex items-center justify-center shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#F4F8F3] tracking-wide flex items-center gap-2">
                Couple Gamification & Accountability Hub
              </h2>
              <p className="text-xs text-[#8EA38A]">
                Earn levels, maintain underspend streaks, redeem overage sponges, and wager high-roller gambles.
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2C3B2C] bg-[#141C14] px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('levels_badges')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'levels_badges'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <Award className="w-4 h-4 text-[#D4A373]" />
            <span>Levels & Badges</span>
          </button>

          <button
            onClick={() => setActiveTab('sponges')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'sponges'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#E58080]" />
            <span>Overage Tasks ({activeSponges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gambles')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'gambles'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <Coins className="w-4 h-4 text-[#7FA1B3]" />
            <span>Overspend Gambles ({activeGambles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <History className="w-4 h-4 text-[#8EA38A]" />
            <span>Score History</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#A8BEA4]" />
            <span>Game Mechanics</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: LEVELS & BADGES */}
          {activeTab === 'levels_badges' && (
            <div className="space-y-6">
              {/* Level Progress Banner */}
              <div className="p-5 rounded-2xl bg-[#1B251B] border border-[#314231] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-[#293829] text-[#B5D0B2] px-2.5 py-0.5 rounded-md border border-[#3F583F]">
                        Current Rank: Level {levelInfo.level}
                      </span>
                      <span className="text-xs font-bold text-[#D4A373]">
                        {totalPoints.toLocaleString()} Total Points
                      </span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#F4F8F3]">
                      {levelInfo.title}
                    </h3>
                    <p className="text-xs text-[#8EA38A]">
                      {levelInfo.description || levelInfo.perks}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#8EA38A]">Discipline Streak</div>
                    <div className="text-lg font-serif font-bold text-[#D4A373] flex items-center justify-end gap-1.5">
                      <Flame className="w-5 h-5 text-[#D4A373]" />
                      <span>{currentStreak} Weeks Active</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#8EA38A]">
                    <span>Level {levelInfo.level} Progress</span>
                    <span>{levelInfo.pointsToNext > 0 ? `${levelInfo.pointsToNext} pts to next rank` : 'Maximum Mastery'}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#121812] overflow-hidden border border-[#273527]">
                    <div
                      className="h-full bg-[#4E684C] transition-all duration-500 rounded-full"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* All Rank Tiers Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#F4F8F3]">Couple Mastery Levels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {LEVEL_TIERS.map((tier) => {
                    const isUnlocked = totalPoints >= tier.minPoints;
                    const isCurrent = levelInfo.level === tier.level;

                    return (
                      <div
                        key={tier.level}
                        className={`p-3.5 rounded-xl border transition ${
                          isCurrent
                            ? 'bg-[#222E22] border-[#8EA38A] shadow-md'
                            : isUnlocked
                            ? 'bg-[#182218] border-[#2E3E2E]'
                            : 'bg-[#111611] border-[#1E261E] text-[#637562]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-[#F4F8F3]">
                            Level {tier.level}: {tier.title}
                          </span>
                          {isCurrent ? (
                            <span className="text-[10px] bg-[#3B4E3A] text-[#B5D0B2] px-2 py-0.5 rounded-md font-bold">
                              Current
                            </span>
                          ) : isUnlocked ? (
                            <Check className="w-4 h-4 text-[#84BA80]" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-[#8EA38A]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#8EA38A]">{tier.perks}</p>
                        <div className="text-[10px] text-[#A8BEA4] font-mono mt-2">
                          {tier.minPoints.toLocaleString()} - {tier.maxPoints.toLocaleString()} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badges Collection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#F4F8F3]">Achievement Badges ({unlockedBadgeIds.length} / {ALL_BADGES.length})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ALL_BADGES.map((badge) => {
                    const isUnlocked = unlockedBadgeIds.includes(badge.id);

                    return (
                      <div
                        key={badge.id}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                          isUnlocked
                            ? 'bg-[#1B251B] border-[#344634]'
                            : 'bg-[#101410] border-[#1D251D] text-[#556454]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#233123] border border-[#384E38] flex items-center justify-center shrink-0">
                          {renderBadgeIcon(badge.icon)}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-[#F4F8F3] truncate">{badge.name}</span>
                            <span className="text-[10px] font-bold text-[#D4A373] bg-[#292019] px-1.5 py-0.5 rounded border border-[#48372A]">
                              +{badge.pointsReward}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8EA38A] leading-snug">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OVERSPENDING SPONGES & REDEMPTION TASKS */}
          {activeTab === 'sponges' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#1B251B] border border-[#314231] space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-[#F4F8F3] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#E58080]" />
                  <span>Negative Sponges & Task Redemptions</span>
                </h3>
                <p className="text-xs text-[#8EA38A]">
                  When weekly spending exceeds your budget ceiling, an overage sponge is attached to the household. Completing all designated redemption tasks expunges the sponge and restores your score!
                </p>
              </div>

              {activeSponges.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#182218] border border-[#2B3A2B] text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-[#84BA80] mx-auto" />
                  <h4 className="font-bold text-base text-[#F4F8F3]">No Active Overspending Sponges!</h4>
                  <p className="text-xs text-[#8EA38A]">
                    You are in pristine standing with zero active overage penalties. Keep up the disciplined spending!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSponges.map((sponge) => (
                    <div
                      key={sponge.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#201915] border border-[#443328] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#36271F] pb-3">
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-[#F4F8F3]">{sponge.title}</h4>
                          <p className="text-xs text-[#A69383]">{sponge.reason}</p>
                        </div>
                        <span className="text-xs font-bold text-[#E58080] bg-[#331C1C] px-2.5 py-1 rounded-lg border border-[#522C2C] self-start sm:self-auto">
                          Penalty: -{sponge.penaltyPoints} pts
                        </span>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-[#8EA38A] uppercase tracking-wider block">
                          Redemption Tasks (Tap to complete):
                        </span>
                        {sponge.tasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => handleTaskClick(sponge.id, task.id)}
                            disabled={togglingTaskId === task.id}
                            className={`w-full p-3 rounded-xl text-left text-xs transition flex items-center justify-between gap-3 border ${
                              task.completed
                                ? 'bg-[#1E291E] border-[#395039] text-[#84BA80]'
                                : 'bg-[#191411] border-[#33251D] text-[#E8DDD5] hover:border-[#4D382C]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-[#84BA80] shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-[#8A7566] shrink-0" />
                              )}
                              <div>
                                <div className={`font-bold ${task.completed ? 'line-through text-[#668564]' : ''}`}>
                                  {task.title}
                                </div>
                                <div className="text-[11px] text-[#A69383]">{task.description}</div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#84BA80] shrink-0">
                              +{task.pointsRestored} pts
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OVERSPEND GAMBLES */}
          {activeTab === 'gambles' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1B251B] border border-[#314231] space-y-4">
                <div className="flex items-center gap-3 border-b border-[#293729] pb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#243324] text-[#7FA1B3] flex items-center justify-center">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#F4F8F3]">
                      High-Roller Underspend Gambles
                    </h3>
                    <p className="text-xs text-[#8EA38A]">
                      If you overspend a week, place a wager to recoup the overage in subsequent weeks for bonus points!
                    </p>
                  </div>
                </div>

                {/* Form to place a gamble */}
                <form onSubmit={handleCreateGamble} className="p-4 rounded-xl bg-[#141C14] border border-[#283728] space-y-3">
                  <h4 className="font-bold text-xs text-[#F4F8F3]">Place an Underspend Gamble for Week {selectedWeekNumber}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#8EA38A]">Wager Amount ({currency})</label>
                      <input
                        type="number"
                        min="10"
                        step="10"
                        value={gambleAmountInput}
                        onChange={(e) => setGambleAmountInput(e.target.value)}
                        placeholder={`e.g. ${overspentDeficit > 0 ? overspentDeficit : 50}`}
                        className="w-full bg-[#1B251B] border border-[#314231] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#8EA38A]">Commitment Note</label>
                      <input
                        type="text"
                        value={gambleNotes}
                        onChange={(e) => setGambleNotes(e.target.value)}
                        placeholder="e.g. Packing lunches all next week to save $60"
                        className="w-full bg-[#1B251B] border border-[#314231] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingGamble}
                    className="bg-[#4E684C] hover:bg-[#5D7B5B] text-[#F4F8F3] font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    {isSubmittingGamble ? 'Placing Gamble...' : 'Confirm & Place Gamble'}
                  </button>
                </form>
              </div>

              {/* Active & Past Gambles */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#F4F8F3]">Household Gambles Log</h4>
                {gambles.length === 0 ? (
                  <p className="text-xs text-[#8EA38A]">No gambles have been placed yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {gambles.map((g) => (
                      <div
                        key={g.id}
                        className="p-3.5 rounded-xl bg-[#182118] border border-[#2A392A] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-[#F4F8F3]">
                            Week {g.weekNumber} Gamble: {currency}{g.gambleAmount}
                          </div>
                          <div className="text-[11px] text-[#8EA38A]">{g.notes}</div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                            g.status === 'won'
                              ? 'bg-[#1E2E1E] text-[#84BA80] border border-[#355035]'
                              : g.status === 'lost'
                              ? 'bg-[#311E1E] text-[#E58080] border border-[#522E2E]'
                              : 'bg-[#2E281E] text-[#D4A373] border border-[#4E3F2E]'
                          }`}
                        >
                          {g.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SCORE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1B251B] border border-[#314231] space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-[#F4F8F3]">Weekly Evaluation Log</h3>
                <p className="text-xs text-[#8EA38A]">Past weekly score evaluations, streak bonuses, and rewards.</p>
              </div>

              {(!score?.history || score.history.length === 0) ? (
                <p className="text-xs text-[#8EA38A]">No weekly scores recorded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {score.history.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#182118] border border-[#2A392A] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#F4F8F3]">{rec.weekLabel}</div>
                        <div className="text-[11px] text-[#8EA38A]">
                          Spent: {currency}{rec.totalSpent} / {currency}{rec.totalBudget} (Net: {rec.netDiff >= 0 ? '+' : ''}{currency}{rec.netDiff})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#84BA80]">+{rec.totalWeekScore} pts</div>
                        {rec.streakBonusPoints > 0 && (
                          <div className="text-[10px] text-[#D4A373]">+{rec.streakBonusPoints} streak bonus</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GAME MECHANICS & RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#1B251B] border border-[#314231] text-xs space-y-4 text-[#D4E0D2] leading-relaxed">
              <h3 className="font-bold text-sm text-[#F4F8F3]">Gamification & Accountability System Rules</h3>

              <div className="space-y-2">
                <h5 className="font-bold text-[#84BA80]">1. Weekly Underspending Score (500+ Base Points)</h5>
                <p>
                  Finishing a week under your adjusted weekly budget earns a baseline 500 points, plus additional points for every surplus dollar saved.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#D4A373]">2. Discipline Streak Multipliers (+5% per week)</h5>
                <p>
                  Achieving 2 or more consecutive weeks under budget activates a compounding streak bonus (+5% per consecutive week).
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#E58080]">3. Overspending Sponges & Task Redemptions</h5>
                <p>
                  Overspending generates an active sponge penalty. Complete cooperative household challenges (cooking at home, no-spend days) to expunge the sponge and restore full points.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[#7FA1B3]">4. High-Roller Gambles</h5>
                <p>
                  Commit to recouping a deficit over subsequent weeks to double your bonus points upon successful completion.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#2C3B2C] flex items-center justify-between bg-[#121912]">
          <div className="text-xs text-[#8EA38A]">
            Current Balance: <strong className="text-[#F4F8F3] font-bold">{totalPoints.toLocaleString()} Points</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#364936] hover:bg-[#465E46] text-[#F4F8F3] font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
