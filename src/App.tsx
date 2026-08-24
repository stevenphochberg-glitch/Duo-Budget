/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Dice5,
  Heart,
  HelpCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Award,
  MessageCircle,
} from 'lucide-react';

import {
  CategoryWeekStatus,
  Household,
  HouseholdSettings,
  MainCategoryKey,
  MonthPeriodData,
  Partner,
  SubcategoryConfig,
  Transaction,
  UserAccount,
  WeekScoreRecord,
  ChatMessage,
} from './types';
import {
  calculateWeeklyBudgetStatuses,
  DEFAULT_SUBCATEGORIES,
  getMonthPeriodData,
} from './utils/budgetCalculations';
import { apiClient } from './api/client';

import { LandingPage } from './components/LandingPage';
import { AuthModals } from './components/AuthModals';
import { Navbar } from './components/Navbar';
import { CategoryCards } from './components/CategoryCards';
import { TransactionList } from './components/TransactionList';
import { QuickExpenseModal } from './components/QuickExpenseModal';
import { GamificationModal } from './components/GamificationModal';
import { GamificationBanner } from './components/GamificationBanner';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { SettingsTutorialModal } from './components/SettingsTutorialModal';
import { MonthOverviewModal } from './components/MonthOverviewModal';
import { CoupleChatDrawer } from './components/CoupleChatDrawer';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<'partner1' | 'partner2'>('partner1');

  // Month and Week state (defaults to August 2026 as per local context)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(7); // 7 = August (0-indexed)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(3);

  // Modals state
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'join' | null>(null);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [quickExpenseDefaultCategory, setQuickExpenseDefaultCategory] = useState<MainCategoryKey>('required');
  const [quickExpenseDefaultSubId, setQuickExpenseDefaultSubId] = useState<string | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isMonthOverviewOpen, setIsMonthOverviewOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialAttachedTransaction, setInitialAttachedTransaction] = useState<Transaction | null>(null);
  const [chatMessageCount, setChatMessageCount] = useState<number>(0);

  // Auto-login from localStorage if available
  useEffect(() => {
    const savedUser = localStorage.getItem('duobudget_user');
    const savedHouseholdId = localStorage.getItem('duobudget_household_id');
    if (savedUser && savedHouseholdId) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setActivePartnerId(parsedUser.partnerId === 'partner2' ? 'partner2' : 'partner1');
        loadHouseholdData(savedHouseholdId);
      } catch (e) {
        console.error('Failed to parse saved session', e);
      }
    }
  }, []);

  const loadHouseholdData = async (householdId: string) => {
    try {
      const hRes = await apiClient.fetchHousehold(householdId);
      if (hRes.household) {
        setHousehold(hRes.household);
      }
      const tRes = await apiClient.fetchTransactions(householdId);
      if (tRes.transactions) {
        setTransactions(tRes.transactions);
      }
    } catch (err) {
      console.error('Failed to load household data', err);
    }
  };

  // Real-time chat messages listener for badge counter
  useEffect(() => {
    if (!household?.id) return;
    const unsub = apiClient.subscribeToMessages(household.id, (msgs) => {
      setChatMessageCount(msgs.length);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [household?.id]);

  const handleDemoLogin = async () => {
    const res = await apiClient.login('alex@duobudget.test', 'demo1234');
    setUser(res.user);
    setHousehold(res.household);
    setActivePartnerId('partner1');
    localStorage.setItem('duobudget_user', JSON.stringify(res.user));
    localStorage.setItem('duobudget_household_id', res.household.id);
    loadHouseholdData(res.household.id);
  };

  const handleAuthSuccess = (loggedUser: UserAccount, loggedHousehold: Household) => {
    setUser(loggedUser);
    setHousehold(loggedHousehold);
    setActivePartnerId(loggedUser.partnerId === 'partner2' ? 'partner2' : 'partner1');
    localStorage.setItem('duobudget_user', JSON.stringify(loggedUser));
    localStorage.setItem('duobudget_household_id', loggedHousehold.id);
    loadHouseholdData(loggedHousehold.id);

    // If new user or tutorial not yet completed, launch tutorial modal
    const tutorialDone = localStorage.getItem(`duobudget_tutorial_done_${loggedHousehold.id}`);
    if (!tutorialDone) {
      setIsTutorialOpen(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setHousehold(null);
    setTransactions([]);
    localStorage.removeItem('duobudget_user');
    localStorage.removeItem('duobudget_household_id');
  };

  // Compute month period data (calendar vs fiscal)
  const monthData: MonthPeriodData = useMemo(() => {
    const settings = household?.settings || {
      calendarMode: 'calendar',
      firstDayOfWeek: 1,
      currencySymbol: '$',
      partner1: { id: 'partner1', name: 'Alex', avatarEmoji: '🦦', color: '#5B8296' },
      partner2: { id: 'partner2', name: 'Jordan', avatarEmoji: '🐱', color: '#A26A42' },
    };
    return getMonthPeriodData(selectedYear, selectedMonthIndex, settings, new Date(selectedYear, selectedMonthIndex, 18));
  }, [selectedYear, selectedMonthIndex, household?.settings]);

  // Ensure selectedWeekNumber is valid for the month
  useEffect(() => {
    if (selectedWeekNumber > monthData.totalWeeksInMonth) {
      setSelectedWeekNumber(monthData.totalWeeksInMonth);
    }
  }, [monthData, selectedWeekNumber]);

  // Active subcategories list
  const subcategories = household?.subcategories || DEFAULT_SUBCATEGORIES;

  // Active Partner object
  const activePartner: Partner = useMemo(() => {
    if (!household) {
      return { id: 'partner1', name: 'Alex', avatarEmoji: '🦦', color: '#5B8296' };
    }
    return activePartnerId === 'partner1' ? household.settings.partner1 : household.settings.partner2;
  }, [activePartnerId, household]);

  // Compute live dynamic weekly budget status with week-to-week rollover & parent budget awareness
  const weeklyStatus = useMemo(() => {
    return calculateWeeklyBudgetStatuses(
      subcategories,
      transactions,
      monthData,
      selectedWeekNumber,
      household?.settings
    );
  }, [subcategories, transactions, monthData, selectedWeekNumber, household?.settings]);

  const currency = household?.settings.currencySymbol || '$';

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonthIndex((m) => m - 1);
    }
    setSelectedWeekNumber(1);
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonthIndex((m) => m + 1);
    }
    setSelectedWeekNumber(1);
  };

  // Transaction Actions
  const handleOpenAddExpense = (mainCategory: MainCategoryKey = 'required', subId?: string) => {
    setEditingTransaction(null);
    setQuickExpenseDefaultCategory(mainCategory);
    setQuickExpenseDefaultSubId(subId);
    setIsQuickExpenseOpen(true);
  };

  const handleSaveExpense = async (data: any) => {
    if (data.id) {
      // Edit
      const res = await apiClient.updateTransaction(data.id, data);
      setTransactions((prev) =>
        prev.map((t) => (t.id === data.id ? res.transaction : t))
      );
    } else {
      // Create
      const res = await apiClient.addTransaction(data);
      if (data.initialReaction) {
        await apiClient.toggleReaction(res.transaction.id, data.partnerId, data.initialReaction);
        res.transaction.reactions = { [data.partnerId]: [data.initialReaction] };
      }
      setTransactions((prev) => [res.transaction, ...prev]);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    await apiClient.deleteTransaction(txId);
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  const handleToggleReaction = async (txId: string, emoji: string) => {
    // Optimistic UI update
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId) {
          const reactions = { ...(t.reactions || {}) };
          const pReactions = [...(reactions[activePartner.id] || [])];
          const idx = pReactions.indexOf(emoji);
          if (idx > -1) {
            pReactions.splice(idx, 1);
          } else {
            pReactions.push(emoji);
          }
          reactions[activePartner.id] = pReactions;
          return { ...t, reactions };
        }
        return t;
      })
    );

    try {
      await apiClient.toggleReaction(txId, activePartner.id, emoji);
    } catch (err) {
      console.error('Failed to toggle reaction', err);
    }
  };

  // Gamification Handlers
  const handlePlaceGamble = async (data: any) => {
    const res = await apiClient.placeGamble(data);
    setHousehold(res.household);
  };

  const handleResolveGamble = async (
    householdId: string,
    gambleId: string,
    status: 'won' | 'lost',
    scoreImpact: number
  ) => {
    const res = await apiClient.resolveGamble(householdId, gambleId, status, scoreImpact);
    setHousehold(res.household);
  };

  const handleRecordWeekScore = async (weekRecord: WeekScoreRecord) => {
    if (!household) return;
    const res = await apiClient.recordWeekScore(household.id, weekRecord);
    setHousehold(res.household);
  };

  const handleToggleSpongeTask = async (spongeId: string, taskId: string) => {
    if (!household) return;
    const res = await apiClient.toggleSpongeTask(household.id, spongeId, taskId);
    setHousehold(res.household);
  };

  // Settings Handlers
  const handleSaveSettings = async (settings: Partial<HouseholdSettings>) => {
    if (!household) return;
    const res = await apiClient.updateSettings(household.id, settings);
    setHousehold(res.household);
  };

  const handleSaveSubcategories = async (updatedSubs: SubcategoryConfig[]) => {
    if (!household) return;
    const res = await apiClient.updateSubcategories(household.id, updatedSubs);
    setHousehold(res.household);
  };

  // If not logged in, show polished landing page with instant demo access
  if (!user || !household) {
    return (
      <>
        <LandingPage
          onDemoLogin={handleDemoLogin}
          onOpenLogin={() => setAuthModalMode('login')}
          onOpenRegister={() => setAuthModalMode('register')}
          onOpenJoin={() => setAuthModalMode('join')}
        />
        <AuthModals
          mode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  const currentWeek = monthData.weeks.find((w) => w.weekNumber === selectedWeekNumber) || monthData.weeks[0];
  const isWeekUnderBudget = weeklyStatus.weekDiff >= 0;

  return (
    <div className="min-h-screen bg-[#111611] text-[#E8EFE6] selection:bg-[#445B42] selection:text-[#F4F8F3] pb-24">
      {/* Top Navbar */}
      <Navbar
        household={household}
        activePartner={activePartner}
        onSwitchPartner={(pId) => setActivePartnerId(pId as any)}
        monthData={monthData}
        selectedWeekNumber={selectedWeekNumber}
        onSelectWeek={(w) => setSelectedWeekNumber(w)}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onOpenQuickExpense={() => handleOpenAddExpense('required')}
        onOpenGamification={() => setIsGamificationOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenMonthOverview={() => setIsMonthOverviewOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        chatMessageCount={chatMessageCount}
        onLogout={handleLogout}
        weeklyBudget={weeklyStatus.totalWeeklyAdjustedBudget}
        weekDiff={weeklyStatus.weekDiff}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* High-Priority Gamification Levels, Badges, Streaks & Sponges Banner */}
        <section>
          <GamificationBanner
            household={household}
            activePartner={activePartner}
            monthData={monthData}
            selectedWeekNumber={selectedWeekNumber}
            currentWeekDiff={weeklyStatus.weekDiff}
            currency={currency}
            onOpenGamificationModal={() => setIsGamificationOpen(true)}
            onToggleTask={handleToggleSpongeTask}
          />
        </section>

        {/* Weekly Dynamic Budget Hero Banner (Sage & Beige Earthy Styling) */}
        <section className="bg-[#172017] border border-[#2B3B2B] rounded-3xl p-6 shadow-sm relative overflow-hidden text-[#E8EFE6]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Week Title & Status */}
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4A373] bg-[#2A231C] border border-[#4B3B2C] px-2.5 py-0.5 rounded-full">
                  {currentWeek.label}
                </span>
                {currentWeek.isCurrent && (
                  <span className="text-xs font-bold text-[#84BA80] bg-[#1E2D1E] border border-[#354D35] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60935D] animate-ping" />
                    Live Active Week
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F8F3] flex items-center gap-2 tracking-tight">
                <span>Week {selectedWeekNumber} Dynamic Budget</span>
              </h1>
              <p className="text-xs text-[#8EA38A] mt-1 max-w-xl leading-relaxed">
                Overspending or underspending automatically recalculates the remaining weeks of {monthData.monthTitle}. Resets cleanly at month end.
              </p>
            </div>

            {/* Right: Key Stats Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Stat 1: Adjusted Week Budget */}
              <div className="p-3.5 bg-[#121812] rounded-2xl border border-[#253225]">
                <span className="text-[11px] text-[#8EA38A] block mb-0.5 font-bold">
                  Week Budget Pool
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-[#F4F8F3]">
                  {currency}{weeklyStatus.totalWeeklyAdjustedBudget.toFixed(0)}
                </div>
                <span className="text-[10px] text-[#7A8E77]">
                  Month Target: {currency}{weeklyStatus.totalMonthlyBudget}
                </span>
              </div>

              {/* Stat 2: Spent This Week */}
              <div className="p-3.5 bg-[#121812] rounded-2xl border border-[#253225]">
                <span className="text-[11px] text-[#8EA38A] block mb-0.5 font-bold">
                  Spent This Week
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-[#F4F8F3]">
                  {currency}{weeklyStatus.totalSpentThisWeek.toFixed(2)}
                </div>
                <span className="text-[10px] text-[#7A8E77]">
                  Month: {currency}{weeklyStatus.totalSpentThisMonth.toFixed(0)}
                </span>
              </div>

              {/* Stat 3: Week Net Standing / Gamified Pace */}
              <div className="p-3.5 bg-[#121812] rounded-2xl border border-[#253225] col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#8EA38A] block mb-0.5 font-bold">
                  Week Balance
                </span>
                <div
                  className={`text-lg sm:text-xl font-extrabold flex items-center gap-1 ${
                    isWeekUnderBudget ? 'text-[#84BA80]' : 'text-[#E58080]'
                  }`}
                >
                  <span>{isWeekUnderBudget ? '+' : '-'}{currency}{Math.abs(weeklyStatus.weekDiff).toFixed(2)}</span>
                </div>
                <span className="text-[10px] text-[#7A8E77]">
                  {isWeekUnderBudget ? 'Underspent (+Score)' : 'Overspent (-Score)'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Quick Log Shortcuts */}
          <div className="mt-6 pt-4 border-t border-[#232F23] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-[11px] text-[#8EA38A] mb-1">
                <span>Weekly Budget Utilization:</span>
                <span className="font-bold text-[#F4F8F3]">
                  {Math.round(
                    weeklyStatus.totalWeeklyAdjustedBudget > 0
                      ? (weeklyStatus.totalSpentThisWeek / weeklyStatus.totalWeeklyAdjustedBudget) * 100
                      : 0
                  )}%
                </span>
              </div>
              <div className="w-full bg-[#121812] h-2 rounded-full overflow-hidden border border-[#232F23]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    !isWeekUnderBudget
                      ? 'bg-[#E58080]' // Red strictly for extreme overages
                      : weeklyStatus.totalSpentThisWeek > weeklyStatus.totalWeeklyAdjustedBudget * 0.8
                      ? 'bg-[#D4A373]'
                      : 'bg-[#60935D]'
                  }`}
                  style={{
                    width: `${Math.min(100, weeklyStatus.totalWeeklyAdjustedBudget > 0 ? (weeklyStatus.totalSpentThisWeek / weeklyStatus.totalWeeklyAdjustedBudget) * 100 : 0)}%`,
                  }}
                />
              </div>
            </div>

            {/* Quick Category Action Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#8EA38A] hidden md:inline">Quick Log:</span>
              <button
                onClick={() => handleOpenAddExpense('required', 'groceries')}
                className="px-2.5 py-1 rounded-xl bg-[#202B20] hover:bg-[#2C3B2C] text-xs text-[#C5DAC2] hover:text-[#F4F8F3] transition flex items-center gap-1.5 border border-[#2E3E2E]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7FA1B3]" />
                <span>Groceries</span>
              </button>
              <button
                onClick={() => handleOpenAddExpense('discretionary')}
                className="px-2.5 py-1 rounded-xl bg-[#28211A] hover:bg-[#382D24] text-xs text-[#D4A373] hover:text-white transition flex items-center gap-1.5 border border-[#45372B]"
              >
                <Award className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Fun Money</span>
              </button>
              <button
                onClick={() => handleOpenAddExpense('required', 'gas')}
                className="px-2.5 py-1 rounded-xl bg-[#202B20] hover:bg-[#2C3B2C] text-xs text-[#C5DAC2] hover:text-[#F4F8F3] transition flex items-center gap-1.5 border border-[#2E3E2E]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#7FA1B3]" />
                <span>Gas / Transit</span>
              </button>
              <button
                onClick={() => handleOpenAddExpense('reserved', 'investing')}
                className="px-2.5 py-1 rounded-xl bg-[#1E2B1E] hover:bg-[#2A3C2A] text-xs text-[#84BA80] hover:text-white transition flex items-center gap-1.5 border border-[#304530]"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#84BA80]" />
                <span>Investing</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3 Major Spending Tiers (Required, Discretionary, Reserved) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F4F8F3] flex items-center gap-2">
                <span>Spending Tiers & Dynamic Allocations</span>
              </h2>
              <p className="text-xs text-[#8EA38A]">
                Fixed, Variable & Hybrid categories auto-adjusting for Week {selectedWeekNumber}
              </p>
            </div>
          </div>

          <CategoryCards
            categoryStatuses={weeklyStatus.categories}
            settings={household.settings}
            onQuickAddExpense={handleOpenAddExpense}
          />
        </section>

        {/* Expenses & Real-Time Partner Reactions */}
        <section>
          <TransactionList
            transactions={transactions}
            subcategories={subcategories}
            household={household}
            activePartner={activePartner}
            currency={currency}
            selectedWeekNumber={selectedWeekNumber}
            onToggleReaction={handleToggleReaction}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsQuickExpenseOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onAddExpenseClick={() => handleOpenAddExpense('required')}
            onShareToChat={(tx) => {
              setInitialAttachedTransaction(tx);
              setIsChatOpen(true);
            }}
          />
        </section>
      </main>

      {/* Floating Couple Chat Quick Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsChatOpen(true)}
          className="relative group bg-[#2A382A] hover:bg-[#384C38] text-[#F4F8F3] p-3.5 rounded-2xl shadow-lg border border-[#486047] flex items-center gap-2.5 transition-all transform hover:scale-105 font-bold text-sm"
          title="Open Couple Chat"
        >
          <MessageCircle className="w-5 h-5 text-[#84BA80]" />
          <span className="hidden sm:inline font-bold">Couple Chat</span>
          {chatMessageCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#A26A42] text-white">
              {chatMessageCount > 99 ? '99+' : chatMessageCount}
            </span>
          )}
        </button>
      </div>

      {/* MODALS */}
      <CoupleChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setInitialAttachedTransaction(null);
        }}
        household={household}
        activePartner={activePartner}
        allTransactions={transactions}
        initialAttachedTransaction={initialAttachedTransaction}
        onClearInitialAttachedTransaction={() => setInitialAttachedTransaction(null)}
        onSelectTransactionToView={(tx) => {
          setIsChatOpen(false);
          setEditingTransaction(tx);
          setIsQuickExpenseOpen(true);
        }}
      />

      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        household={household}
        activePartner={activePartner}
        subcategories={subcategories}
        currency={currency}
        defaultCategory={quickExpenseDefaultCategory}
        defaultSubcategoryId={quickExpenseDefaultSubId}
        editingTransaction={editingTransaction}
        onSaveExpense={handleSaveExpense}
      />

      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
        household={household}
        activePartner={activePartner}
        monthData={monthData}
        selectedWeekNumber={selectedWeekNumber}
        currentWeekDiff={weeklyStatus.weekDiff}
        currentWeekTotalBudget={weeklyStatus.totalWeeklyAdjustedBudget}
        currentWeekTotalSpent={weeklyStatus.totalSpentThisWeek}
        monthTotalBudget={weeklyStatus.totalMonthlyBudget}
        monthTotalSpent={weeklyStatus.totalSpentThisMonth}
        currency={currency}
        onPlaceGamble={handlePlaceGamble}
        onResolveGamble={handleResolveGamble}
        onRecordWeekScore={handleRecordWeekScore}
      />

      <BudgetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        household={household}
        subcategories={subcategories}
        onSaveSettings={handleSaveSettings}
        onSaveSubcategories={handleSaveSubcategories}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      <SettingsTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        household={household}
        subcategories={subcategories}
        onSaveSettings={handleSaveSettings}
        onSaveSubcategories={handleSaveSubcategories}
      />

      <MonthOverviewModal
        isOpen={isMonthOverviewOpen}
        onClose={() => setIsMonthOverviewOpen(false)}
        household={household}
        subcategories={subcategories}
        transactions={transactions}
        monthData={monthData}
        currency={currency}
        onSelectWeek={(w) => setSelectedWeekNumber(w)}
      />

      <AuthModals
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
