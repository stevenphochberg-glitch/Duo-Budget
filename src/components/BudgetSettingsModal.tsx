import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Calendar,
  DollarSign,
  Users,
  Copy,
  Check,
  Plus,
  Save,
  Sliders,
  Shield,
  Trash2,
  Edit2,
  PieChart,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Coins,
  Wallet,
  Leaf,
  CheckCircle2,
  Info,
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

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  subcategories: SubcategoryConfig[];
  onSaveSettings: (settings: Partial<HouseholdSettings>) => Promise<void>;
  onSaveSubcategories: (subcategories: SubcategoryConfig[]) => Promise<void>;
  onOpenTutorial?: () => void;
}

const AVAILABLE_ICONS = [
  'Home',
  'ShoppingCart',
  'Zap',
  'Receipt',
  'Phone',
  'Car',
  'Fuel',
  'Tv',
  'Utensils',
  'Film',
  'ShoppingBag',
  'Sparkles',
  'Plane',
  'Shield',
  'PiggyBank',
  'Landmark',
  'CreditCard',
  'TrendingUp',
  'Heart',
  'Coffee',
  'Book',
  'Leaf',
];

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  household,
  subcategories: initialSubcategories,
  onSaveSettings,
  onSaveSubcategories,
  onOpenTutorial,
}) => {
  const [activeTab, setActiveTab] = useState<'income_and_budget' | 'calendar' | 'partners' | 'sync'>('income_and_budget');

  // Income Settings (FIRST INPUT)
  const initialIncome: IncomeSettings = household.settings.income || {
    totalMonthlyIncome: 6500,
    partner1Income: 3500,
    partner2Income: 3000,
    splitMode: 'individual',
  };

  const [incomeMode, setIncomeMode] = useState<'individual' | 'joint'>(initialIncome.splitMode || 'individual');
  const [p1Income, setP1Income] = useState<number>(initialIncome.partner1Income ?? 3500);
  const [p2Income, setP2Income] = useState<number>(initialIncome.partner2Income ?? 3000);
  const [totalIncomeJoint, setTotalIncomeJoint] = useState<number>(
    initialIncome.totalMonthlyIncome || (initialIncome.partner1Income + initialIncome.partner2Income) || 6500
  );

  const effectiveTotalIncome = incomeMode === 'individual' ? p1Income + p2Income : totalIncomeJoint;

  // Parent Category Budgets (Required, Discretionary, Reserve)
  const defaultParents: ParentCategoryBudget = household.settings.parentBudgets || {
    required: initialSubcategories.filter((s) => s.mainCategory === 'required').reduce((acc, s) => acc + s.targetMonthlyBudget, 0) || 2900,
    discretionary: initialSubcategories.filter((s) => s.mainCategory === 'discretionary').reduce((acc, s) => acc + s.targetMonthlyBudget, 0) || 1180,
    reserved: initialSubcategories.filter((s) => s.mainCategory === 'reserved').reduce((acc, s) => acc + s.targetMonthlyBudget, 0) || 950,
  };

  const [parentBudgets, setParentBudgets] = useState<ParentCategoryBudget>(defaultParents);

  // Subcategories local state
  const [subcategories, setSubcategories] = useState<SubcategoryConfig[]>(initialSubcategories);

  // New subcategory inline creation states
  const [addingCategoryFor, setAddingCategoryFor] = useState<MainCategoryKey | null>(null);
  const [newName, setNewName] = useState('');
  const [newSpendingType, setNewSpendingType] = useState<SpendingType>('variable');
  const [newBudget, setNewBudget] = useState(200);
  const [newFixedBase, setNewFixedBase] = useState(100);
  const [newIcon, setNewIcon] = useState('Sparkles');

  // Other Household settings
  const [calendarMode, setCalendarMode] = useState<'calendar' | 'fiscal'>(
    household.settings.calendarMode || 'calendar'
  );
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<number>(
    household.settings.firstDayOfWeek ?? 0
  );
  const [currencySymbol, setCurrencySymbol] = useState<string>(
    household.settings.currencySymbol || '$'
  );

  const [p1Name, setP1Name] = useState(household.settings.partner1.name);
  const [p1Insignia, setP1Insignia] = useState(household.settings.partner1.avatarEmoji || 'botanical_leaf');
  const [p1Color, setP1Color] = useState(household.settings.partner1.color || '#5B8296');

  const [p2Name, setP2Name] = useState(household.settings.partner2.name);
  const [p2Insignia, setP2Insignia] = useState(household.settings.partner2.avatarEmoji || 'hearth_flame');
  const [p2Color, setP2Color] = useState(household.settings.partner2.color || '#A26A42');

  const [copiedCode, setCopiedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever modal opens or household/subcategories change
  useEffect(() => {
    if (isOpen) {
      setSubcategories(initialSubcategories);
      setParentBudgets(household.settings.parentBudgets || defaultParents);
      setP1Name(household.settings.partner1.name);
      setP2Name(household.settings.partner2.name);
      setP1Insignia(household.settings.partner1.avatarEmoji || 'botanical_leaf');
      setP2Insignia(household.settings.partner2.avatarEmoji || 'hearth_flame');
      setP1Color(household.settings.partner1.color || '#5B8296');
      setP2Color(household.settings.partner2.color || '#A26A42');
      setCurrencySymbol(household.settings.currencySymbol || '$');
      setCalendarMode(household.settings.calendarMode || 'calendar');
      setFirstDayOfWeek(household.settings.firstDayOfWeek ?? 0);
      setErrorMessage(null);
    }
  }, [isOpen, initialSubcategories, household]);

  if (!isOpen) return null;

  // Subcategory mutations
  const handleSubcategoryChange = (
    id: string,
    field: keyof SubcategoryConfig,
    value: any
  ) => {
    setSubcategories((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return { ...sub, [field]: value };
        }
        return sub;
      })
    );
  };

  const handleDeleteSubcategory = (id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreateSubcategory = (mainCat: MainCategoryKey) => {
    if (!newName.trim()) return;
    const newSub: SubcategoryConfig = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newName.trim(),
      mainCategory: mainCat,
      spendingType: newSpendingType,
      targetMonthlyBudget: Math.max(0, Number(newBudget) || 0),
      fixedBaseAmount: newSpendingType === 'hybrid' ? Math.max(0, Number(newFixedBase) || 0) : 0,
      iconName: newIcon || 'Sparkles',
      description: `${newSpendingType} allocation`,
    };

    setSubcategories((prev) => [...prev, newSub]);
    setAddingCategoryFor(null);
    setNewName('');
    setNewBudget(200);
    setNewFixedBase(100);
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const incomeConfig: IncomeSettings = {
        totalMonthlyIncome: effectiveTotalIncome,
        partner1Income: incomeMode === 'individual' ? p1Income : Number((effectiveTotalIncome / 2).toFixed(2)),
        partner2Income: incomeMode === 'individual' ? p2Income : Number((effectiveTotalIncome / 2).toFixed(2)),
        splitMode: incomeMode,
      };

      // If user typed a subcategory but forgot to click "+ Add", automatically include it
      let allSubsToSave = [...subcategories];
      if (addingCategoryFor && newName.trim()) {
        const autoSub: SubcategoryConfig = {
          id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: newName.trim(),
          mainCategory: addingCategoryFor,
          spendingType: newSpendingType,
          targetMonthlyBudget: Math.max(0, Number(newBudget) || 0),
          fixedBaseAmount: newSpendingType === 'hybrid' ? Math.max(0, Number(newFixedBase) || 0) : 0,
          iconName: newIcon || 'Sparkles',
          description: `${newSpendingType} allocation`,
        };
        allSubsToSave.push(autoSub);
      }

      // Sanitize subcategories locally before dispatching to eliminate any undefined values
      const cleanSubcategories = allSubsToSave.map((sub) => {
        const clean: SubcategoryConfig = {
          id: sub.id || 'sub_' + Math.random().toString(36).substring(2, 8),
          name: (sub.name || 'Custom Category').trim(),
          mainCategory: sub.mainCategory || 'required',
          spendingType: sub.spendingType || 'variable',
          targetMonthlyBudget: Number(sub.targetMonthlyBudget) || 0,
          iconName: sub.iconName || 'Tag',
          description: sub.description || '',
        };
        if (sub.spendingType === 'hybrid' || (sub.fixedBaseAmount !== undefined && sub.fixedBaseAmount !== null)) {
          clean.fixedBaseAmount = Number(sub.fixedBaseAmount) || 0;
        }
        return clean;
      });

      await onSaveSettings({
        calendarMode,
        firstDayOfWeek,
        currencySymbol,
        income: incomeConfig,
        parentBudgets,
        partner1: {
          ...household.settings.partner1,
          name: p1Name.trim() || 'Partner 1',
          avatarEmoji: p1Insignia,
          color: p1Color,
        },
        partner2: {
          ...household.settings.partner2,
          name: p2Name.trim() || 'Partner 2',
          avatarEmoji: p2Insignia,
          color: p2Color,
        },
      });

      await onSaveSubcategories(cleanSubcategories);

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Error saving settings & subcategories:', err);
      setErrorMessage(err?.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper calculation for parent vs subcategories
  const getCategoryAllocation = (catKey: MainCategoryKey) => {
    const parentTarget = parentBudgets[catKey] || 0;
    const subs = subcategories.filter((s) => s.mainCategory === catKey);
    const allocatedSum = subs.reduce((sum, s) => sum + (Number(s.targetMonthlyBudget) || 0), 0);
    const diff = parentTarget - allocatedSum;
    return {
      parentTarget,
      allocatedSum,
      diff,
      isExact: diff === 0,
      isUnder: diff > 0,
      isOver: diff < 0,
      subCount: subs.length,
    };
  };

  const totalBudgetAcrossParents = parentBudgets.required + parentBudgets.discretionary + parentBudgets.reserved;
  const unallocatedIncome = effectiveTotalIncome - totalBudgetAcrossParents;
  const incomeSavingsRate = effectiveTotalIncome > 0 ? ((parentBudgets.reserved + Math.max(0, unallocatedIncome)) / effectiveTotalIncome) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0D120D]">
      <div className="bg-[#161F16] border border-[#2F3E2F] text-[#E8EFE6] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Solid Art Nouveau Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C3B2C] flex items-center justify-between bg-[#121912]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#243324] border border-[#3C523C] text-[#8EA38A] flex items-center justify-center shadow-inner">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#F4F8F3] tracking-wide flex items-center gap-2">
                Household Budget & Sync Settings
              </h2>
              <p className="text-xs text-[#8EA38A]">
                Configure monthly income, parent budget limits, subcategories, and partner heraldry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTutorial && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTutorial();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#223322] hover:bg-[#2E452E] border border-[#3A503A] text-[#A8C5A4] hover:text-[#F4F8F3] text-xs font-bold flex items-center gap-1.5 transition"
                title="Launch Step-by-Step Setup Tutorial"
              >
                <Compass className="w-3.5 h-3.5 text-[#84BA80]" />
                <span className="hidden sm:inline">Guided Tutorial</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8EA38A] hover:text-[#F4F8F3] hover:bg-[#202B20] transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Solid & Touch-friendly for Kitchen Tablet */}
        <div className="flex border-b border-[#2C3B2C] bg-[#141C14] px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('income_and_budget')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'income_and_budget'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <Wallet className="w-4 h-4 text-[#8EA38A]" />
            <span>1. Income & Budget Allocations</span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'partners'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <Users className="w-4 h-4 text-[#D4A373]" />
            <span>2. Partners & Emblems</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#5B8296]" />
            <span>3. Calendar & Currency</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-[#8EA38A] text-[#F4F8F3] bg-[#1E291E]'
                : 'border-[#141C14] text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#192319]'
            }`}
          >
            <Copy className="w-4 h-4 text-[#7FA1B3]" />
            <span>4. Partner Sync Code</span>
          </button>
        </div>

        {/* Error message banner if any */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[#341F1F] border border-[#633333] text-[#F4D0D0] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E58080] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: INCOME & BUDGET HIERARCHY (REQUIRED, DISCRETIONARY, RESERVE) */}
          {/* ========================================================================= */}
          {activeTab === 'income_and_budget' && (
            <div className="space-y-6">
              {/* SECTION A: INCOME CONFIGURATION (FIRST INPUT) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1B251B] border border-[#314231] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#293629] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#273727] text-[#D4A373] flex items-center justify-center font-bold">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#F4F8F3]">
                        Monthly Household Income
                      </h3>
                      <p className="text-xs text-[#8EA38A]">
                        Define total monthly earnings to gauge savings rate and budget safety margins.
                      </p>
                    </div>
                  </div>

                  {/* Split mode switcher */}
                  <div className="flex items-center bg-[#111811] p-1 rounded-xl border border-[#263426] text-xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setIncomeMode('individual')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        incomeMode === 'individual'
                          ? 'bg-[#2E3E2E] text-[#F4F8F3] shadow-sm'
                          : 'text-[#8EA38A] hover:text-[#D4E0D2]'
                      }`}
                    >
                      Individual Breakdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncomeMode('joint')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        incomeMode === 'joint'
                          ? 'bg-[#2E3E2E] text-[#F4F8F3] shadow-sm'
                          : 'text-[#8EA38A] hover:text-[#D4E0D2]'
                      }`}
                    >
                      Single Joint Total
                    </button>
                  </div>
                </div>

                {/* Income Inputs */}
                {incomeMode === 'individual' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Partner 1 Income */}
                    <div className="p-3.5 rounded-xl bg-[#141C14] border border-[#2A392A] space-y-1.5">
                      <label className="text-xs font-bold text-[#8EA38A] flex items-center justify-between">
                        <span>{p1Name}'s Monthly Income</span>
                        <span className="text-[10px] text-[#5B8296] font-mono font-bold">
                          {effectiveTotalIncome > 0 ? ((p1Income / effectiveTotalIncome) * 100).toFixed(0) : 0}% of Total
                        </span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-[#8EA38A] font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={p1Income}
                          onChange={(e) => setP1Income(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full bg-[#1A241A] border border-[#314231] rounded-xl pl-7 pr-3 py-2 text-sm text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A] transition"
                        />
                      </div>
                    </div>

                    {/* Partner 2 Income */}
                    <div className="p-3.5 rounded-xl bg-[#141C14] border border-[#2A392A] space-y-1.5">
                      <label className="text-xs font-bold text-[#8EA38A] flex items-center justify-between">
                        <span>{p2Name}'s Monthly Income</span>
                        <span className="text-[10px] text-[#A26A42] font-mono font-bold">
                          {effectiveTotalIncome > 0 ? ((p2Income / effectiveTotalIncome) * 100).toFixed(0) : 0}% of Total
                        </span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-[#8EA38A] font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={p2Income}
                          onChange={(e) => setP2Income(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full bg-[#1A241A] border border-[#314231] rounded-xl pl-7 pr-3 py-2 text-sm text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A] transition"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#141C14] border border-[#2A392A] space-y-1.5">
                    <label className="text-xs font-bold text-[#8EA38A]">
                      Combined Monthly Take-Home Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-[#8EA38A] font-bold">{currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={totalIncomeJoint}
                        onChange={(e) => setTotalIncomeJoint(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-[#1A241A] border border-[#314231] rounded-xl pl-7 pr-3 py-2 text-sm text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A] transition"
                      />
                    </div>
                  </div>
                )}

                {/* Income Summary Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#121812] border border-[#243124] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8EA38A]">Total Household Income:</span>
                    <strong className="text-sm font-extrabold text-[#F4F8F3]">
                      {currencySymbol}{effectiveTotalIncome.toLocaleString()} / mo
                    </strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8EA38A]">Allocated to Budgets:</span>
                    <strong className="text-xs font-bold text-[#7FA1B3]">
                      {currencySymbol}{totalBudgetAcrossParents.toLocaleString()} ({effectiveTotalIncome > 0 ? ((totalBudgetAcrossParents / effectiveTotalIncome) * 100).toFixed(0) : 0}%)
                    </strong>
                    <span className="text-[#8EA38A]">Unallocated Buffer:</span>
                    <strong className={`text-xs font-bold ${unallocatedIncome >= 0 ? 'text-[#84BA80]' : 'text-[#E58080]'}`}>
                      {currencySymbol}{unallocatedIncome.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION B: PARENT CATEGORY BUDGET SETTINGS & SUB-ALLOCATIONS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#293629] pb-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#F4F8F3] flex items-center gap-2">
                      <span>Parent Tier Budgets & Subcategory Allocations</span>
                    </h3>
                    <p className="text-xs text-[#8EA38A]">
                      Set the overall ceiling for Required, Discretionary, and Reserve, then allocate to individual subcategories.
                    </p>
                  </div>
                </div>

                {/* 3 PARENT CATEGORY BLOCKS */}
                {(['required', 'discretionary', 'reserved'] as MainCategoryKey[]).map((catKey) => {
                  const alloc = getCategoryAllocation(catKey);
                  const title =
                    catKey === 'required'
                      ? 'Required Living Expenses'
                      : catKey === 'discretionary'
                      ? 'Discretionary (Fun & Lifestyle)'
                      : 'Reserve & Sinking Funds';

                  const badgeColor =
                    catKey === 'required'
                      ? 'text-[#7FA1B3] bg-[#1E2933] border-[#314352]'
                      : catKey === 'discretionary'
                      ? 'text-[#D4A373] bg-[#2E251E] border-[#4E3D31]'
                      : 'text-[#84BA80] bg-[#1F2B1F] border-[#334633]';

                  const catSubs = subcategories.filter((s) => s.mainCategory === catKey);

                  return (
                    <div
                      key={catKey}
                      className="rounded-2xl bg-[#1B251B] border border-[#314231] p-4 sm:p-5 shadow-sm space-y-4"
                    >
                      {/* Parent Tier Header & Budget Input */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#293629] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${badgeColor}`}>
                            {catKey}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm sm:text-base text-[#F4F8F3]">{title}</h4>
                            <p className="text-[11px] text-[#8EA38A]">
                              {catSubs.length} subcategories configured
                            </p>
                          </div>
                        </div>

                        {/* Parent Target Input */}
                        <div className="flex items-center gap-2 bg-[#121812] border border-[#273527] rounded-xl px-3 py-1.5">
                          <span className="text-xs text-[#8EA38A] font-bold">Parent Budget:</span>
                          <span className="text-xs text-[#D4E0D2] font-bold">{currencySymbol}</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={parentBudgets[catKey]}
                            onChange={(e) =>
                              setParentBudgets((prev) => ({
                                ...prev,
                                [catKey]: Math.max(0, Number(e.target.value) || 0),
                              }))
                            }
                            className="w-24 bg-[#1A241A] border border-[#314231] rounded-lg px-2 py-1 text-sm text-[#F4F8F3] font-extrabold text-right outline-none focus:border-[#8EA38A]"
                          />
                          <span className="text-xs text-[#8EA38A]">/ mo</span>
                        </div>
                      </div>

                      {/* Parent Allocation Progress Bar & Status */}
                      <div className="p-3 bg-[#131913] rounded-xl border border-[#253225] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8EA38A]">
                            Subcategories Sum: <strong className="text-[#F4F8F3]">{currencySymbol}{alloc.allocatedSum.toLocaleString()}</strong> of {currencySymbol}{alloc.parentTarget.toLocaleString()}
                          </span>
                          <span
                            className={`font-bold ${
                              alloc.isExact
                                ? 'text-[#84BA80]'
                                : alloc.isUnder
                                ? 'text-[#7FA1B3]'
                                : 'text-[#E58080]'
                            }`}
                          >
                            {alloc.isExact
                              ? '✓ 100% Balanced'
                              : alloc.isUnder
                              ? `${currencySymbol}${alloc.diff.toFixed(0)} unallocated`
                              : `⚠ ${currencySymbol}${Math.abs(alloc.diff).toFixed(0)} over allocated`}
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-[#1D271D] overflow-hidden border border-[#2A372A]">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              alloc.isOver ? 'bg-[#E58080]' : alloc.isExact ? 'bg-[#84BA80]' : 'bg-[#5B8296]'
                            }`}
                            style={{
                              width: `${Math.min(100, alloc.parentTarget > 0 ? (alloc.allocatedSum / alloc.parentTarget) * 100 : 0)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Child Subcategories List */}
                      <div className="space-y-2.5">
                        {catSubs.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3 rounded-xl bg-[#141C14] border border-[#283728] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#384D38] transition"
                          >
                            {/* Subcategory Name & Type */}
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <input
                                type="text"
                                value={sub.name}
                                onChange={(e) => handleSubcategoryChange(sub.id, 'name', e.target.value)}
                                className="bg-[#1A241A] border border-[#2F3E2F] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold text-[#F4F8F3] outline-none focus:border-[#8EA38A] flex-1 min-w-[140px]"
                                placeholder="Subcategory Name"
                              />

                              {/* Spending Type Selector */}
                              <select
                                value={sub.spendingType}
                                onChange={(e) =>
                                  handleSubcategoryChange(sub.id, 'spendingType', e.target.value as SpendingType)
                                }
                                className="bg-[#1A241A] border border-[#2F3E2F] rounded-lg px-2 py-1.5 text-xs text-[#D4E0D2] font-semibold outline-none"
                              >
                                <option value="fixed">Fixed</option>
                                <option value="variable">Variable</option>
                                <option value="hybrid">Hybrid</option>
                              </select>
                            </div>

                            {/* Subcategory Budget Inputs & Delete */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {sub.spendingType === 'hybrid' && (
                                <div className="flex items-center gap-1 bg-[#1A241A] border border-[#2F3E2F] rounded-lg px-2 py-1" title="Fixed Base portion">
                                  <span className="text-[10px] text-[#8EA38A]">Base:</span>
                                  <span className="text-xs text-[#8EA38A]">{currencySymbol}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="10"
                                    value={sub.fixedBaseAmount ?? 0}
                                    onChange={(e) =>
                                      handleSubcategoryChange(
                                        sub.id,
                                        'fixedBaseAmount',
                                        Math.max(0, Number(e.target.value) || 0)
                                      )
                                    }
                                    className="w-16 bg-[#182418] text-xs font-bold text-[#D4E0D2] text-right outline-none rounded px-1"
                                  />
                                </div>
                              )}

                              <div className="flex items-center gap-1 bg-[#1A241A] border border-[#2F3E2F] rounded-lg px-2.5 py-1">
                                <span className="text-[10px] text-[#8EA38A]">Budget:</span>
                                <span className="text-xs text-[#8EA38A]">{currencySymbol}</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="25"
                                  value={sub.targetMonthlyBudget}
                                  onChange={(e) =>
                                    handleSubcategoryChange(
                                      sub.id,
                                      'targetMonthlyBudget',
                                      Math.max(0, Number(e.target.value) || 0)
                                    )
                                  }
                                  className="w-20 bg-[#1A241A] text-xs sm:text-sm font-bold text-[#F4F8F3] text-right outline-none rounded px-1"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                className="p-1.5 rounded-lg text-[#8EA38A] hover:text-[#E58080] hover:bg-[#2A1E1E] transition"
                                title="Delete subcategory"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Subcategory Trigger */}
                        {addingCategoryFor === catKey ? (
                          <div className="p-3.5 rounded-xl bg-[#121812] border border-[#3A4D3A] space-y-3 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between text-xs font-bold text-[#8EA38A]">
                              <span>Add New {catKey} Subcategory</span>
                              <button
                                onClick={() => setAddingCategoryFor(null)}
                                className="text-xs text-[#8EA38A] hover:text-[#F4F8F3]"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Subcategory Name (e.g. Subscriptions)"
                                className="bg-[#1A241A] border border-[#314231] rounded-lg px-3 py-2 text-xs text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A]"
                                autoFocus
                              />

                              <select
                                value={newSpendingType}
                                onChange={(e) => setNewSpendingType(e.target.value as SpendingType)}
                                className="bg-[#1A241A] border border-[#314231] rounded-lg px-2.5 py-2 text-xs text-[#D4E0D2] font-semibold outline-none"
                              >
                                <option value="variable">Variable Spending</option>
                                <option value="fixed">Fixed Allocation</option>
                                <option value="hybrid">Hybrid (Fixed + Variable)</option>
                              </select>

                              <div className="flex items-center gap-1.5">
                                <div className="relative flex-1">
                                  <span className="absolute left-2.5 top-2 text-xs text-[#8EA38A]">{currencySymbol}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="25"
                                    value={newBudget}
                                    onChange={(e) => setNewBudget(Math.max(0, Number(e.target.value) || 0))}
                                    placeholder="Monthly Budget"
                                    className="w-full bg-[#1A241A] border border-[#314231] rounded-lg pl-6 pr-2 py-2 text-xs text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A]"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleCreateSubcategory(catKey)}
                                  className="bg-[#4E684C] hover:bg-[#5D7B5B] text-[#F4F8F3] font-bold text-xs px-3.5 py-2 rounded-lg transition"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAddingCategoryFor(catKey);
                              setNewName('');
                              setNewBudget(150);
                            }}
                            className="w-full py-2 rounded-xl border border-dashed border-[#2E3C2E] hover:border-[#8EA38A] text-xs font-bold text-[#8EA38A] hover:text-[#F4F8F3] hover:bg-[#182218] transition flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Subcategory to {title}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PARTNERS & HERALDIC EMBLEMS */}
          {/* ========================================================================= */}
          {activeTab === 'partners' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#1B251B] border border-[#314231] space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-[#F4F8F3] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8EA38A]" />
                  <span>Partner Personas & Vector Crests</span>
                </h3>
                <p className="text-xs text-[#8EA38A]">
                  Personalize names, distinctive accent colors, and botanical Art Nouveau emblems. No emojis are used.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Partner 1 Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#1B251B] border border-[#314231] space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar avatar={p1Insignia} color={p1Color} size="lg" />
                    <div>
                      <h4 className="font-bold text-sm text-[#F4F8F3]">Partner 1 Settings</h4>
                      <p className="text-xs text-[#8EA38A]">Primary household creator</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8EA38A]">Name</label>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                      className="w-full bg-[#141C14] border border-[#2A392A] rounded-xl px-3 py-2 text-sm text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8EA38A]">Accent Color</label>
                    <div className="flex items-center gap-2">
                      {['#5B8296', '#7E9F7A', '#A26A42', '#8C6344', '#4E684C'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setP1Color(col)}
                          className={`w-7 h-7 rounded-lg border-2 transition ${
                            p1Color === col ? 'border-white scale-110' : 'border-[#1B251B]'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8EA38A]">Select Vector Emblem</label>
                    <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 bg-[#121812] rounded-xl border border-[#243124]">
                      {AVATAR_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setP1Insignia(opt.id)}
                          className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                            p1Insignia === opt.id
                              ? 'bg-[#273727] border-[#8EA38A] shadow-sm'
                              : 'bg-[#182118] border-[#222E22] hover:bg-[#1F2B1F]'
                          }`}
                          title={opt.name}
                        >
                          <Avatar avatar={opt.id} color={p1Color} size="sm" />
                          <span className="text-[9px] text-[#A8BEA4] truncate w-full text-center">{opt.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Partner 2 Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#1B251B] border border-[#314231] space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar avatar={p2Insignia} color={p2Color} size="lg" />
                    <div>
                      <h4 className="font-bold text-sm text-[#F4F8F3]">Partner 2 Settings</h4>
                      <p className="text-xs text-[#8EA38A]">Co-partner</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8EA38A]">Name</label>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      className="w-full bg-[#141C14] border border-[#2A392A] rounded-xl px-3 py-2 text-sm text-[#F4F8F3] font-bold outline-none focus:border-[#8EA38A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8EA38A]">Accent Color</label>
                    <div className="flex items-center gap-2">
                      {['#A26A42', '#D4A373', '#8C6344', '#7E9F7A', '#5B8296'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setP2Color(col)}
                          className={`w-7 h-7 rounded-lg border-2 transition ${
                            p2Color === col ? 'border-white scale-110' : 'border-[#1B251B]'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8EA38A]">Select Vector Emblem</label>
                    <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 bg-[#121812] rounded-xl border border-[#243124]">
                      {AVATAR_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setP2Insignia(opt.id)}
                          className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                            p2Insignia === opt.id
                              ? 'bg-[#273727] border-[#8EA38A] shadow-sm'
                              : 'bg-[#182118] border-[#222E22] hover:bg-[#1F2B1F]'
                          }`}
                          title={opt.name}
                        >
                          <Avatar avatar={opt.id} color={p2Color} size="sm" />
                          <span className="text-[9px] text-[#A8BEA4] truncate w-full text-center">{opt.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CALENDAR & CURRENCY */}
          {/* ========================================================================= */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1B251B] border border-[#314231] space-y-4">
                <h3 className="font-bold text-sm sm:text-base text-[#F4F8F3] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8EA38A]" />
                  <span>Calendar Structure & Currency Symbol</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Calendar Mode */}
                  <div className="p-3.5 rounded-xl bg-[#141C14] border border-[#2A392A] space-y-2">
                    <label className="text-xs font-bold text-[#8EA38A]">Month Partition Mode</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCalendarMode('calendar')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                          calendarMode === 'calendar'
                            ? 'bg-[#2A3B2A] text-[#F4F8F3] border-[#4E684C]'
                            : 'bg-[#192319] text-[#8EA38A] border-[#243324] hover:text-[#D4E0D2]'
                        }`}
                      >
                        Calendar Month
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarMode('fiscal')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                          calendarMode === 'fiscal'
                            ? 'bg-[#2A3B2A] text-[#F4F8F3] border-[#4E684C]'
                            : 'bg-[#192319] text-[#8EA38A] border-[#243324] hover:text-[#D4E0D2]'
                        }`}
                      >
                        Fiscal 4-Week
                      </button>
                    </div>
                  </div>

                  {/* Currency Symbol */}
                  <div className="p-3.5 rounded-xl bg-[#141C14] border border-[#2A392A] space-y-2">
                    <label className="text-xs font-bold text-[#8EA38A]">Currency Symbol</label>
                    <div className="flex gap-2">
                      {['$', '€', '£', '¥', 'C$'].map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => setCurrencySymbol(sym)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                            currencySymbol === sym
                              ? 'bg-[#2A3B2A] text-[#F4F8F3] border-[#4E684C]'
                              : 'bg-[#192319] text-[#8EA38A] border-[#243324] hover:text-[#D4E0D2]'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PARTNER SYNC CODE */}
          {/* ========================================================================= */}
          {activeTab === 'sync' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#1B251B] border border-[#314231] text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#243324] border border-[#3D523D] text-[#8EA38A] flex items-center justify-center mx-auto shadow-inner">
                <Copy className="w-6 h-6" />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-bold text-base text-[#F4F8F3]">Household Invite & Sync Code</h3>
                <p className="text-xs text-[#8EA38A]">
                  Share this unique code with your partner so they can join on their mobile device or kitchen tablet.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 p-3 bg-[#111811] border border-[#2A392A] rounded-2xl">
                <span className="font-mono text-2xl font-black text-[#D4A373] tracking-widest px-3">
                  {household.inviteCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyInviteCode}
                  className="px-4 py-2 rounded-xl bg-[#394B39] hover:bg-[#486048] text-xs font-bold text-[#F4F8F3] transition flex items-center gap-1.5 shadow-sm"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#84BA80]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Solid Art Nouveau Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#2C3B2C] flex items-center justify-between bg-[#121912]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#8EA38A] hover:text-[#F4F8F3] transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#4E684C] hover:bg-[#5D7B5B] disabled:bg-[#253325] disabled:text-[#6A8168] text-[#F4F8F3] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition"
          >
            {isSaving ? (
              <span>Saving Changes...</span>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#84BA80]" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings & Budgets</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
