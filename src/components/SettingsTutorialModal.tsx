import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  Users,
  DollarSign,
  PieChart,
  Layers,
  Calendar,
  Zap,
  Award,
  Sparkles,
  Home,
  ShoppingCart,
  Receipt,
  Utensils,
  Plane,
  Shield,
  Plus,
  Trash2,
  HelpCircle,
  Flame,
  ArrowRight,
  Compass,
} from 'lucide-react';
import {
  Household,
  HouseholdSettings,
  IncomeSettings,
  MainCategoryKey,
  ParentCategoryBudget,
  SpendingType,
  SubcategoryConfig,
} from '../types';
import { AVATAR_OPTIONS, Avatar } from './Avatar';

interface SettingsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  subcategories: SubcategoryConfig[];
  onSaveSettings: (settings: Partial<HouseholdSettings>) => Promise<void>;
  onSaveSubcategories: (subcategories: SubcategoryConfig[]) => Promise<void>;
}

const TUTORIAL_STEPS = [
  { id: 1, title: 'Household & Partners', shortLabel: 'Partners', icon: Users },
  { id: 2, title: 'Monthly Income', shortLabel: 'Income', icon: DollarSign },
  { id: 3, title: 'Parent Category Budgets', shortLabel: 'Budgets', icon: PieChart },
  { id: 4, title: 'Custom Subcategories', shortLabel: 'Categories', icon: Layers },
  { id: 5, title: 'Billing & Week Reset', shortLabel: 'Calendar', icon: Calendar },
  { id: 6, title: 'Fast Logging & Reactions', shortLabel: 'Logging', icon: Zap },
  { id: 7, title: 'Summary & Gamification', shortLabel: 'Summary', icon: Award },
];

const TOTAL_STEPS = TUTORIAL_STEPS.length; // 7 steps, strictly <= 10

const STARTER_PRESET_CATEGORIES: SubcategoryConfig[] = [
  {
    id: 'rent',
    name: 'Rent / Mortgage',
    mainCategory: 'required',
    spendingType: 'fixed',
    targetMonthlyBudget: 1800,
    iconName: 'Home',
    description: 'Fixed housing cost prorated across weeks',
  },
  {
    id: 'groceries',
    name: 'Groceries & Essentials',
    mainCategory: 'required',
    spendingType: 'variable',
    targetMonthlyBudget: 600,
    iconName: 'ShoppingCart',
    description: 'Weekly supermarket runs and home supplies',
  },
  {
    id: 'utilities',
    name: 'Utilities (Electric & Gas)',
    mainCategory: 'required',
    spendingType: 'hybrid',
    targetMonthlyBudget: 200,
    fixedBaseAmount: 120,
    iconName: 'Zap',
    description: 'Fixed delivery base fee + variable utility usage',
  },
  {
    id: 'dining',
    name: 'Restaurants & Coffee',
    mainCategory: 'discretionary',
    spendingType: 'variable',
    targetMonthlyBudget: 400,
    iconName: 'Utensils',
    description: 'Date nights, takeout, weekend coffees',
  },
  {
    id: 'vacation_fund',
    name: 'Vacation & Travel Fund',
    mainCategory: 'reserved',
    spendingType: 'fixed',
    targetMonthlyBudget: 300,
    iconName: 'Plane',
    description: 'Reserved savings for couple getaways',
  },
  {
    id: 'emergency_buffer',
    name: 'Emergency Safety Buffer',
    mainCategory: 'reserved',
    spendingType: 'fixed',
    targetMonthlyBudget: 250,
    iconName: 'Shield',
    description: 'Rainy day buffer for unexpected repairs',
  },
];

export const SettingsTutorialModal: React.FC<SettingsTutorialModalProps> = ({
  isOpen,
  onClose,
  household,
  subcategories: initialSubcategories,
  onSaveSettings,
  onSaveSubcategories,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local Form States
  const [householdName, setHouseholdName] = useState(household.name || 'Our Household');
  const [partner1Name, setPartner1Name] = useState(household.settings?.partner1?.name || 'Partner 1');
  const [partner1Emoji, setPartner1Emoji] = useState(household.settings?.partner1?.avatarEmoji || 'botanical_leaf');
  const [partner1Color, setPartner1Color] = useState(household.settings?.partner1?.color || '#5B8296');

  const [partner2Name, setPartner2Name] = useState(household.settings?.partner2?.name || 'Partner 2');
  const [partner2Emoji, setPartner2Emoji] = useState(household.settings?.partner2?.avatarEmoji || 'hearth_flame');
  const [partner2Color, setPartner2Color] = useState(household.settings?.partner2?.color || '#A26A42');

  // Income State
  const [incomeMode, setIncomeMode] = useState<'individual' | 'joint'>(
    household.settings?.income?.splitMode || 'individual'
  );
  const [p1Income, setP1Income] = useState<number>(household.settings?.income?.partner1Income || 0);
  const [p2Income, setP2Income] = useState<number>(household.settings?.income?.partner2Income || 0);
  const [jointIncome, setJointIncome] = useState<number>(household.settings?.income?.totalMonthlyIncome || 0);

  const calculatedTotalIncome = incomeMode === 'individual' ? p1Income + p2Income : jointIncome;

  // Parent Category Budgets
  const [reqBudget, setReqBudget] = useState<number>(household.settings?.parentBudgets?.required || 0);
  const [discBudget, setDiscBudget] = useState<number>(household.settings?.parentBudgets?.discretionary || 0);
  const [resBudget, setResBudget] = useState<number>(household.settings?.parentBudgets?.reserved || 0);

  const totalAllocatedBudget = reqBudget + discBudget + resBudget;
  const incomeRemaining = calculatedTotalIncome - totalAllocatedBudget;

  // Subcategories
  const [subcategories, setSubcategories] = useState<SubcategoryConfig[]>(
    initialSubcategories.length > 0 ? initialSubcategories : []
  );

  // Quick category adding state
  const [newCatName, setNewCatName] = useState('');
  const [newCatMain, setNewCatMain] = useState<MainCategoryKey>('required');
  const [newCatType, setNewCatType] = useState<SpendingType>('variable');
  const [newCatBudget, setNewCatBudget] = useState<number>(200);
  const [newCatFixedBase, setNewCatFixedBase] = useState<number>(100);

  // Calendar Settings
  const [calendarMode, setCalendarMode] = useState<'calendar' | 'fiscal'>(
    household.settings?.calendarMode || 'calendar'
  );
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<number>(
    household.settings?.firstDayOfWeek !== undefined ? household.settings.firstDayOfWeek : 0
  );
  const [currencySymbol, setCurrencySymbol] = useState<string>(
    household.settings?.currencySymbol || '$'
  );

  if (!isOpen) return null;

  // Save all configured settings to backend
  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      const updatedIncome: IncomeSettings = {
        splitMode: incomeMode,
        partner1Income: p1Income,
        partner2Income: p2Income,
        totalMonthlyIncome: calculatedTotalIncome,
      };

      const updatedParents: ParentCategoryBudget = {
        required: reqBudget,
        discretionary: discBudget,
        reserved: resBudget,
      };

      const updatedSettings: Partial<HouseholdSettings> = {
        calendarMode,
        firstDayOfWeek,
        currencySymbol,
        income: updatedIncome,
        parentBudgets: updatedParents,
        partner1: {
          id: 'partner1',
          name: partner1Name.trim() || 'Partner 1',
          avatarEmoji: partner1Emoji,
          color: partner1Color,
        },
        partner2: {
          id: 'partner2',
          name: partner2Name.trim() || 'Partner 2',
          avatarEmoji: partner2Emoji,
          color: partner2Color,
        },
      };

      await onSaveSettings(updatedSettings);
      await onSaveSubcategories(subcategories);

      // Mark tutorial completed in localStorage
      localStorage.setItem(`duobudget_tutorial_done_${household.id}`, 'true');

      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Failed to save tutorial settings', err);
      setIsSaving(false);
    }
  };

  const handleApplyPresetCategories = () => {
    setSubcategories(STARTER_PRESET_CATEGORIES);
    // Auto-populate parent budgets to match presets
    const reqSum = STARTER_PRESET_CATEGORIES.filter((c) => c.mainCategory === 'required').reduce((acc, c) => acc + c.targetMonthlyBudget, 0);
    const discSum = STARTER_PRESET_CATEGORIES.filter((c) => c.mainCategory === 'discretionary').reduce((acc, c) => acc + c.targetMonthlyBudget, 0);
    const resSum = STARTER_PRESET_CATEGORIES.filter((c) => c.mainCategory === 'reserved').reduce((acc, c) => acc + c.targetMonthlyBudget, 0);
    setReqBudget(reqSum);
    setDiscBudget(discSum);
    setResBudget(resSum);
  };

  const handleAddCustomCategory = () => {
    if (!newCatName.trim()) return;
    const newId = 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);
    const item: SubcategoryConfig = {
      id: newId,
      name: newCatName.trim(),
      mainCategory: newCatMain,
      spendingType: newCatType,
      targetMonthlyBudget: Number(newCatBudget) || 0,
      fixedBaseAmount: newCatType === 'hybrid' ? Number(newCatFixedBase) || 0 : undefined,
      iconName: newCatMain === 'required' ? 'Home' : newCatMain === 'discretionary' ? 'Utensils' : 'Shield',
    };
    setSubcategories([...subcategories, item]);
    setNewCatName('');
  };

  const handleRemoveCategory = (id: string) => {
    setSubcategories(subcategories.filter((c) => c.id !== id));
  };

  return (
    <div
      id="settings-tutorial-modal-overlay"
      className="fixed inset-0 z-50 bg-[#0D120D] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        id="settings-tutorial-modal-container"
        className="bg-[#141D14] border border-[#2D3E2D] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* ========================================================================= */}
        {/* Top Header & Step Progress Bar */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-[#182318] border-b border-[#283928] flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#243324] border border-[#3A503A] text-[#A8C5A4] flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-[#F4F8F3]">
                    Setup & Settings Guide
                  </h2>
                  <span className="bg-[#243324] text-[#A8C5A4] border border-[#3A503A] text-xs font-bold font-mono px-2.5 py-0.5 rounded-full">
                    Step {currentStep} of {TOTAL_STEPS}
                  </span>
                </div>
                <p className="text-xs text-[#8EA38A]">
                  Personalize your household settings and configure your clean couple budget
                </p>
              </div>
            </div>

            <button
              id="tutorial-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#202C20] hover:bg-[#2A3B2A] border border-[#2D3E2D] text-[#8EA38A] hover:text-[#F4F8F3] transition"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Pill Navigation (Strictly 7 steps <= 10 summary) */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {TUTORIAL_STEPS.map((step) => {
              const StepIcon = step.icon;
              const isPast = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  id={`tutorial-nav-step-${step.id}`}
                  onClick={() => setCurrentStep(step.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition text-center ${
                    isCurrent
                      ? 'bg-[#273827] border-[#4E684C] text-[#F4F8F3] shadow-sm'
                      : isPast
                      ? 'bg-[#182318] border-[#2D3E2D] text-[#A8C5A4]'
                      : 'bg-[#101710] border-[#1E281E] text-[#637560] hover:text-[#8EA38A]'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold font-mono">{step.id}</span>
                    <StepIcon className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-medium hidden sm:inline truncate w-full">
                    {step.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Main Content Area by Step */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 text-[#E8EFE6] space-y-6">
          {/* STEP 1: HOUSEHOLD & PARTNER PROFILES */}
          {currentStep === 1 && (
            <div id="tutorial-step-1" className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#283928] pb-4">
                <div className="flex items-center gap-2 text-[#A8C5A4] text-xs font-bold uppercase tracking-wider mb-1">
                  <Users className="w-4 h-4" /> Step 1 of {TOTAL_STEPS} • Couple Sanctuary
                </div>
                <h3 className="text-xl font-serif font-bold text-[#F4F8F3]">
                  Name Your Household & Personalize Profiles
                </h3>
                <p className="text-xs text-[#8EA38A] mt-1">
                  Give your joint budget a meaningful name and customize each partner's nickname, avatar badge, and signature color for fast expense logging.
                </p>
              </div>

              {/* Household Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#D4E0D2]">Household Name</label>
                <input
                  id="tutorial-household-name"
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="e.g. Alex & Jordan’s Haven"
                  className="w-full bg-[#0E140E] border border-[#2B3C2B] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                />
              </div>

              {/* Partner 1 & Partner 2 Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Partner 1 */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7FA1B3]">
                    <Avatar avatar={partner1Emoji} color={partner1Color} size="sm" />
                    <span>Partner 1 Profile</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8EA38A] mb-1">Name</label>
                    <input
                      id="tutorial-partner1-name"
                      type="text"
                      value={partner1Name}
                      onChange={(e) => setPartner1Name(e.target.value)}
                      className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8EA38A] mb-1">Avatar Icon</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {AVATAR_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPartner1Emoji(opt.id)}
                          className={`p-1.5 rounded-lg border flex items-center justify-center transition ${
                            partner1Emoji === opt.id
                              ? 'bg-[#2A3B2A] border-[#7FA1B3]'
                              : 'bg-[#101710] border-[#222E22] hover:bg-[#1A251A]'
                          }`}
                          title={opt.name}
                        >
                          <Avatar avatar={opt.id} color={partner1Color} size="xs" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Partner 2 */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D4A373]">
                    <Avatar avatar={partner2Emoji} color={partner2Color} size="sm" />
                    <span>Partner 2 Profile</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8EA38A] mb-1">Name</label>
                    <input
                      id="tutorial-partner2-name"
                      type="text"
                      value={partner2Name}
                      onChange={(e) => setPartner2Name(e.target.value)}
                      className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8EA38A] mb-1">Avatar Icon</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {AVATAR_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPartner2Emoji(opt.id)}
                          className={`p-1.5 rounded-lg border flex items-center justify-center transition ${
                            partner2Emoji === opt.id
                              ? 'bg-[#2A3B2A] border-[#D4A373]'
                              : 'bg-[#101710] border-[#222E22] hover:bg-[#1A251A]'
                          }`}
                          title={opt.name}
                        >
                          <Avatar avatar={opt.id} color={partner2Color} size="xs" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MONTHLY INCOME */}
          {currentStep === 2 && (
            <div id="tutorial-step-2" className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#283928] pb-4">
                <div className="flex items-center gap-2 text-[#A8C5A4] text-xs font-bold uppercase tracking-wider mb-1">
                  <DollarSign className="w-4 h-4" /> Step 2 of {TOTAL_STEPS} • Cashflow Foundation
                </div>
                <h3 className="text-xl font-serif font-bold text-[#F4F8F3]">
                  Enter Your Monthly Income & Contribution Mode
                </h3>
                <p className="text-xs text-[#8EA38A] mt-1">
                  Establish your household cashflow. Choose between proportional individual tracking (enter each partner's take-home pay) or a joint pooled total.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-3">
                <button
                  id="tutorial-income-mode-individual"
                  type="button"
                  onClick={() => setIncomeMode('individual')}
                  className={`flex-1 p-3 rounded-xl border text-left transition ${
                    incomeMode === 'individual'
                      ? 'bg-[#1F2C1F] border-[#4E684C] text-[#F4F8F3]'
                      : 'bg-[#121912] border-[#243224] text-[#8EA38A]'
                  }`}
                >
                  <div className="font-bold text-xs">Individual Split</div>
                  <div className="text-[11px] text-[#8EA38A] mt-0.5">Track {partner1Name} and {partner2Name}'s incomes separately</div>
                </button>

                <button
                  id="tutorial-income-mode-joint"
                  type="button"
                  onClick={() => setIncomeMode('joint')}
                  className={`flex-1 p-3 rounded-xl border text-left transition ${
                    incomeMode === 'joint'
                      ? 'bg-[#1F2C1F] border-[#4E684C] text-[#F4F8F3]'
                      : 'bg-[#121912] border-[#243224] text-[#8EA38A]'
                  }`}
                >
                  <div className="font-bold text-xs">Joint Household Total</div>
                  <div className="text-[11px] text-[#8EA38A] mt-0.5">Single combined monthly paycheck pool</div>
                </button>
              </div>

              {/* Income Inputs */}
              {incomeMode === 'individual' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                    <label className="block text-xs font-bold text-[#7FA1B3]">
                      {partner1Name}'s Monthly Take-Home ($)
                    </label>
                    <input
                      id="tutorial-p1-income"
                      type="number"
                      min={0}
                      value={p1Income || ''}
                      onChange={(e) => setP1Income(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-sm text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                    <label className="block text-xs font-bold text-[#D4A373]">
                      {partner2Name}'s Monthly Take-Home ($)
                    </label>
                    <input
                      id="tutorial-p2-income"
                      type="number"
                      min={0}
                      value={p2Income || ''}
                      onChange={(e) => setP2Income(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-sm text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <label className="block text-xs font-bold text-[#D4E0D2]">
                    Total Joint Monthly Income ($)
                  </label>
                  <input
                    id="tutorial-joint-income"
                    type="number"
                    min={0}
                    value={jointIncome || ''}
                    onChange={(e) => setJointIncome(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-sm text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                  />
                </div>
              )}

              {/* Total Income Banner */}
              <div className="p-4 rounded-xl bg-[#121912] border border-[#233123] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#8EA38A]">Effective Monthly Household Income:</span>
                  <div className="text-xl font-bold font-serif text-[#84BA80]">
                    {currencySymbol}{calculatedTotalIncome.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-lg bg-[#1E2B1E] border border-[#344834] text-[#A8C5A4] font-medium">
                  {incomeMode === 'individual' ? '2 Earners' : 'Joint Combined'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: PARENT CATEGORY BUDGETS */}
          {currentStep === 3 && (
            <div id="tutorial-step-3" className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#283928] pb-4">
                <div className="flex items-center gap-2 text-[#A8C5A4] text-xs font-bold uppercase tracking-wider mb-1">
                  <PieChart className="w-4 h-4" /> Step 3 of {TOTAL_STEPS} • Macro Pillars
                </div>
                <h3 className="text-xl font-serif font-bold text-[#F4F8F3]">
                  Allocate into 3 Core Parent Buckets
                </h3>
                <p className="text-xs text-[#8EA38A] mt-1">
                  DuoBudget organizes spending into 3 clear pillars. Assign monthly targets to cover needs, wants, and savings.
                </p>
              </div>

              {/* 3 Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Required */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#7FA1B3]" />
                    <label className="text-xs font-bold text-[#F4F8F3]">1. Required ($)</label>
                  </div>
                  <p className="text-[10px] text-[#8EA38A]">Housing, groceries, bills, transport</p>
                  <input
                    id="tutorial-budget-required"
                    type="number"
                    min={0}
                    value={reqBudget || ''}
                    onChange={(e) => setReqBudget(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-sm text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                  />
                </div>

                {/* 2. Discretionary */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#D4A373]" />
                    <label className="text-xs font-bold text-[#F4F8F3]">2. Discretionary ($)</label>
                  </div>
                  <p className="text-[10px] text-[#8EA38A]">Dining, entertainment, shopping</p>
                  <input
                    id="tutorial-budget-discretionary"
                    type="number"
                    min={0}
                    value={discBudget || ''}
                    onChange={(e) => setDiscBudget(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-sm text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                  />
                </div>

                {/* 3. Reserved */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#84BA80]" />
                    <label className="text-xs font-bold text-[#F4F8F3]">3. Reserved ($)</label>
                  </div>
                  <p className="text-[10px] text-[#8EA38A]">Emergency fund, vacation sinking fund</p>
                  <input
                    id="tutorial-budget-reserved"
                    type="number"
                    min={0}
                    value={resBudget || ''}
                    onChange={(e) => setResBudget(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-sm text-[#F4F8F3] outline-none focus:border-[#4E684C]"
                  />
                </div>
              </div>

              {/* Total Budget Check */}
              <div className="p-4 rounded-xl bg-[#121912] border border-[#233123] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="text-xs text-[#8EA38A]">Total Allocated Budget:</div>
                  <div className="text-lg font-bold text-[#F4F8F3]">
                    {currencySymbol}{totalAllocatedBudget.toLocaleString()} / {currencySymbol}{calculatedTotalIncome.toLocaleString()} Income
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                      incomeRemaining >= 0
                        ? 'bg-[#192719] border-[#374C37] text-[#84BA80]'
                        : 'bg-[#2E1919] border-[#4C2E2E] text-[#E58080]'
                    }`}
                  >
                    {incomeRemaining >= 0 ? 'Buffer Remaining: +' : 'Over Allocated: -'}
                    {currencySymbol}{Math.abs(incomeRemaining).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CUSTOM SUBCATEGORIES */}
          {currentStep === 4 && (
            <div id="tutorial-step-4" className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#283928] pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-[#A8C5A4] text-xs font-bold uppercase tracking-wider mb-1">
                      <Layers className="w-4 h-4" /> Step 4 of {TOTAL_STEPS} • Subcategories & Behaviors
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#F4F8F3]">
                      Set Up Your Custom Spending Categories
                    </h3>
                  </div>

                  {/* 1-Click Starter Preset Pack */}
                  <button
                    id="tutorial-apply-presets-btn"
                    type="button"
                    onClick={handleApplyPresetCategories}
                    className="px-3 py-1.5 rounded-xl bg-[#223322] hover:bg-[#2E452E] border border-[#3E553E] text-[#A8C5A4] hover:text-[#F4F8F3] text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Load Couple Starter Pack</span>
                  </button>
                </div>
                <p className="text-xs text-[#8EA38A] mt-1">
                  Define custom categories and their spending behavior: <strong>Fixed</strong> (prorated automatically), <strong>Variable</strong> (dynamic weekly allowances), or <strong>Hybrid</strong> (base amount + variable overage).
                </p>
              </div>

              {/* Inline Add Category */}
              <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-3">
                <div className="text-xs font-bold text-[#D4E0D2]">Add a Custom Category</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    id="tutorial-new-cat-name"
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name (e.g. Groceries)"
                    className="bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] outline-none"
                  />

                  <select
                    id="tutorial-new-cat-main"
                    value={newCatMain}
                    onChange={(e) => setNewCatMain(e.target.value as MainCategoryKey)}
                    className="bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] outline-none"
                  >
                    <option value="required">Required Tier</option>
                    <option value="discretionary">Discretionary Tier</option>
                    <option value="reserved">Reserved Tier</option>
                  </select>

                  <select
                    id="tutorial-new-cat-type"
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as SpendingType)}
                    className="bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] outline-none"
                  >
                    <option value="variable">Variable Spending</option>
                    <option value="fixed">Fixed Prorated</option>
                    <option value="hybrid">Hybrid (Base + Var)</option>
                  </select>

                  <div className="flex gap-2">
                    <input
                      id="tutorial-new-cat-budget"
                      type="number"
                      min={0}
                      value={newCatBudget}
                      onChange={(e) => setNewCatBudget(Number(e.target.value) || 0)}
                      placeholder="Budget ($)"
                      className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] outline-none"
                    />
                    <button
                      id="tutorial-add-cat-btn"
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-3 py-2 bg-[#4E684C] hover:bg-[#5D7B5B] text-white rounded-lg text-xs font-bold transition shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subcategories List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {subcategories.length === 0 ? (
                  <div className="p-6 text-center bg-[#121912] rounded-xl border border-[#233123] text-xs text-[#8EA38A]">
                    No categories created yet. Click <strong>"Load Couple Starter Pack"</strong> above or enter your own custom categories!
                  </div>
                ) : (
                  subcategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl bg-[#141C14] border border-[#243224] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#1F2C1F] flex items-center justify-center text-[#A8C5A4] shrink-0">
                          {cat.mainCategory === 'required' ? <Home className="w-3.5 h-3.5" /> : cat.mainCategory === 'discretionary' ? <Utensils className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-[#F4F8F3] truncate">{cat.name}</div>
                          <div className="text-[10px] text-[#8EA38A]">
                            {cat.mainCategory.toUpperCase()} • {cat.spendingType.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-[#84BA80]">
                          {currencySymbol}{cat.targetMonthlyBudget.toLocaleString()}/mo
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.id)}
                          className="p-1 rounded text-[#8EA38A] hover:text-[#E58080] transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 5: CALENDAR & ACCOUNTING CYCLE */}
          {currentStep === 5 && (
            <div id="tutorial-step-5" className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#283928] pb-4">
                <div className="flex items-center gap-2 text-[#A8C5A4] text-xs font-bold uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4" /> Step 5 of {TOTAL_STEPS} • Cycle & Week Alignment
                </div>
                <h3 className="text-xl font-serif font-bold text-[#F4F8F3]">
                  Align with Your Paychecks & Reset Day
                </h3>
                <p className="text-xs text-[#8EA38A] mt-1">
                  Match your weekly rollover accounting with real-world income dates and chosen currency.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  id="tutorial-calmode-calendar"
                  type="button"
                  onClick={() => setCalendarMode('calendar')}
                  className={`p-4 rounded-xl border text-left transition ${
                    calendarMode === 'calendar'
                      ? 'bg-[#1F2C1F] border-[#4E684C] text-[#F4F8F3]'
                      : 'bg-[#121912] border-[#243224] text-[#8EA38A]'
                  }`}
                >
                  <div className="font-bold text-xs">Calendar Month Mode</div>
                  <div className="text-[11px] text-[#8EA38A] mt-1">
                    Standard 1st of month to final day of month. Partial weeks at boundaries.
                  </div>
                </button>

                <button
                  id="tutorial-calmode-fiscal"
                  type="button"
                  onClick={() => setCalendarMode('fiscal')}
                  className={`p-4 rounded-xl border text-left transition ${
                    calendarMode === 'fiscal'
                      ? 'bg-[#1F2C1F] border-[#4E684C] text-[#F4F8F3]'
                      : 'bg-[#121912] border-[#243224] text-[#8EA38A]'
                  }`}
                >
                  <div className="font-bold text-xs">Fiscal Paycheck Period Mode</div>
                  <div className="text-[11px] text-[#8EA38A] mt-1">
                    Clean 4 or 5 full 7-day weeks aligned directly with paycheck cycles.
                  </div>
                </button>
              </div>

              {/* First Day of Week & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <label className="block text-xs font-bold text-[#D4E0D2]">First Day of the Week</label>
                  <select
                    id="tutorial-first-day"
                    value={firstDayOfWeek}
                    onChange={(e) => setFirstDayOfWeek(Number(e.target.value))}
                    className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] outline-none"
                  >
                    <option value={0}>Sunday (Default)</option>
                    <option value={1}>Monday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <label className="block text-xs font-bold text-[#D4E0D2]">Currency Symbol</label>
                  <select
                    id="tutorial-currency"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full bg-[#0E140E] border border-[#243224] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] outline-none"
                  >
                    <option value="$">$ (USD / CAD / AUD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="¥">¥ (JPY / CNY)</option>
                    <option value="₹">₹ (INR)</option>
                    <option value="kr">kr (SEK / NOK / DKK)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: FAST LOGGING & REACTIONS */}
          {currentStep === 6 && (
            <div id="tutorial-step-6" className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#283928] pb-4">
                <div className="flex items-center gap-2 text-[#A8C5A4] text-xs font-bold uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4" /> Step 6 of {TOTAL_STEPS} • Daily Couple Workflow
                </div>
                <h3 className="text-xl font-serif font-bold text-[#F4F8F3]">
                  1-Click Logging & Instant Partner Reactions
                </h3>
                <p className="text-xs text-[#8EA38A] mt-1">
                  Logging expenses takes less than 5 seconds. Keep finances fun with instant emoji stickers and joint chat.
                </p>
              </div>

              {/* Visual Demo Card */}
              <div className="p-5 rounded-2xl bg-[#121912] border border-[#263526] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#233123]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#202E38] border border-[#354C5C] text-[#7FA1B3] flex items-center justify-center font-bold">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F4F8F3]">Dinner Date Night</div>
                      <div className="text-[10px] text-[#8EA38A]">Discretionary • Logged by {partner1Name}</div>
                    </div>
                  </div>

                  <span className="text-sm font-bold font-mono text-[#F4F8F3]">{currencySymbol}45.00</span>
                </div>

                {/* Reactions Preview */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-[#8EA38A]">Partner Sticker Reactions:</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#1C271C] border border-[#324532] text-xs font-bold flex items-center gap-1 text-[#F4F8F3]">
                      ❤️ <span>Date Night!</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#1C271C] border border-[#324532] text-xs font-bold flex items-center gap-1 text-[#84BA80]">
                      💸 <span>Budget Master</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#1C271C] border border-[#324532] text-xs font-bold flex items-center gap-1 text-[#D4A373]">
                      ⭐ <span>High Five</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-1">
                  <div className="text-xs font-bold text-[#A8C5A4]">Single Click Attribution</div>
                  <p className="text-[11px] text-[#8EA38A]">
                    Tap the partner avatar pill to attribute who paid without filling lengthy dropdowns.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-1">
                  <div className="text-xs font-bold text-[#A8C5A4]">Couple Joint Chat & GIFs</div>
                  <p className="text-[11px] text-[#8EA38A]">
                    Share receipts directly to the joint chat drawer with animated celebratory GIFs and notes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: SUMMARY & GAMIFICATION */}
          {currentStep === 7 && (
            <div id="tutorial-step-7" className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#283928] pb-4">
                <div className="flex items-center gap-2 text-[#A8C5A4] text-xs font-bold uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4" /> Step 7 of {TOTAL_STEPS} • Final Review & Summary
                </div>
                <h3 className="text-xl font-serif font-bold text-[#F4F8F3]">
                  Ready to Start Your Clean Couple Budget
                </h3>
                <p className="text-xs text-[#8EA38A] mt-1">
                  Review your configured settings below. Everything is set up for you to enter your real expenses as you spend!
                </p>
              </div>

              {/* Summary Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Household Info */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <div className="text-xs font-bold text-[#7FA1B3] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Household Profile
                  </div>
                  <div className="text-sm font-bold text-[#F4F8F3]">{householdName}</div>
                  <div className="text-xs text-[#8EA38A] flex items-center gap-2">
                    <span>{partner1Name}</span> & <span>{partner2Name}</span>
                  </div>
                </div>

                {/* Monthly Income */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <div className="text-xs font-bold text-[#84BA80] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Monthly Income
                  </div>
                  <div className="text-sm font-bold text-[#F4F8F3]">
                    {currencySymbol}{calculatedTotalIncome.toLocaleString()} / month
                  </div>
                  <div className="text-xs text-[#8EA38A]">
                    Mode: {incomeMode === 'individual' ? 'Individual Split' : 'Joint Combined'}
                  </div>
                </div>

                {/* Parent Budgets */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <div className="text-xs font-bold text-[#D4A373] flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5" /> Parent Allocations
                  </div>
                  <div className="text-xs space-y-1 text-[#8EA38A]">
                    <div>Required: <strong className="text-[#F4F8F3]">{currencySymbol}{reqBudget.toLocaleString()}</strong></div>
                    <div>Discretionary: <strong className="text-[#F4F8F3]">{currencySymbol}{discBudget.toLocaleString()}</strong></div>
                    <div>Reserved: <strong className="text-[#F4F8F3]">{currencySymbol}{resBudget.toLocaleString()}</strong></div>
                  </div>
                </div>

                {/* Gamification & Dynamic Rollover */}
                <div className="p-4 rounded-xl bg-[#182318] border border-[#2B3C2B] space-y-2">
                  <div className="text-xs font-bold text-[#A8C5A4] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Gamification & Rollovers
                  </div>
                  <div className="text-xs text-[#8EA38A]">
                    Weekly discipline points, under-budget streak bonuses, and redemption task sponges are active.
                  </div>
                  <div className="text-[11px] font-bold text-[#84BA80]">
                    {subcategories.length} Categories Configured
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Modal Footer Controls */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-[#182318] border-t border-[#283928] flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                id="tutorial-prev-btn"
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl bg-[#202C20] hover:bg-[#2A3B2A] border border-[#2D3E2D] text-xs font-bold text-[#D4E0D2] flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="tutorial-skip-btn"
              type="button"
              onClick={handleFinalSave}
              className="px-3.5 py-2 text-xs text-[#8EA38A] hover:text-[#F4F8F3] font-semibold transition"
            >
              Skip to App
            </button>

            {currentStep < TOTAL_STEPS ? (
              <button
                id="tutorial-next-btn"
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1))}
                className="px-5 py-2 rounded-xl bg-[#4E684C] hover:bg-[#5D7B5B] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="tutorial-finish-btn"
                type="button"
                onClick={handleFinalSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#4E684C] hover:bg-[#5D7B5B] text-white text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#84BA80]" />
                    <span>Settings Saved!</span>
                  </>
                ) : isSaving ? (
                  <span>Saving Settings...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Settings & Start Budgeting</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
