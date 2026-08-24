import React from 'react';
import {
  Home,
  Receipt,
  Zap,
  Tv,
  ShoppingCart,
  Fuel,
  Car,
  Sparkles,
  Landmark,
  ShieldAlert,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Shield,
  Heart,
  Coffee,
  PiggyBank,
  Plane,
} from 'lucide-react';
import {
  CategoryWeekStatus,
  HouseholdSettings,
  MainCategoryKey,
  SubcategoryConfig,
  SubcategoryWeekStatus,
} from '../types';

interface CategoryCardsProps {
  categoryStatuses: CategoryWeekStatus[];
  settings: HouseholdSettings;
  onQuickAddExpense: (mainCategory: MainCategoryKey, subcategoryId?: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-3.5 h-3.5" />,
  Receipt: <Receipt className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Tv: <Tv className="w-3.5 h-3.5" />,
  ShoppingCart: <ShoppingCart className="w-3.5 h-3.5" />,
  Fuel: <Fuel className="w-3.5 h-3.5" />,
  Car: <Car className="w-3.5 h-3.5" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Landmark: <Landmark className="w-3.5 h-3.5" />,
  ShieldAlert: <ShieldAlert className="w-3.5 h-3.5" />,
  TrendingUp: <TrendingUp className="w-3.5 h-3.5" />,
  CreditCard: <CreditCard className="w-3.5 h-3.5" />,
  Heart: <Heart className="w-3.5 h-3.5" />,
  Coffee: <Coffee className="w-3.5 h-3.5" />,
  PiggyBank: <PiggyBank className="w-3.5 h-3.5" />,
  Plane: <Plane className="w-3.5 h-3.5" />,
  Leaf: <Leaf className="w-3.5 h-3.5" />,
  Shield: <Shield className="w-3.5 h-3.5" />,
};

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  categoryStatuses,
  settings,
  onQuickAddExpense,
}) => {
  const currency = settings.currencySymbol || '$';

  const requiredCat = categoryStatuses.find((c) => c.categoryKey === 'required');
  const discretionaryCat = categoryStatuses.find((c) => c.categoryKey === 'discretionary');
  const reservedCat = categoryStatuses.find((c) => c.categoryKey === 'reserved');

  return (
    <div className="space-y-6">
      {/* 3 Major Category Grid with Solid Earthy Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ========================================================================= */}
        {/* 1. REQUIRED CATEGORY CARD (SLATE BLUE / SAGE) */}
        {/* ========================================================================= */}
        {requiredCat && (
          <div className="bg-[#182318] border border-[#2D3E2D] rounded-2xl p-5 shadow-sm flex flex-col justify-between text-[#E8EFE6]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#263526]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#202E38] border border-[#354C5C] text-[#7FA1B3] flex items-center justify-center font-bold">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#F4F8F3] text-base">Required Spending</h3>
                    <p className="text-[11px] text-[#8EA38A]">Rent, Bills, Groceries, Transit, Utilities</p>
                  </div>
                </div>
                <button
                  onClick={() => onQuickAddExpense('required')}
                  className="p-2 rounded-xl bg-[#223022] hover:bg-[#2C3E2C] text-[#A8BEA4] hover:text-[#F4F8F3] transition"
                  title="Add Required Expense"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Weekly Budget vs Spent Summary */}
              <div className="my-4 p-3.5 bg-[#121912] rounded-xl border border-[#233123]">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs text-[#8EA38A]">Week Budget:</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#F4F8F3]">
                      {currency}{requiredCat.adjustedWeeklyBudget.toLocaleString()}
                    </span>
                    {requiredCat.adjustedWeeklyBudget !== requiredCat.baseWeeklyBudget && (
                      <span
                        className={`text-[10px] ml-1.5 font-medium ${
                          requiredCat.adjustedWeeklyBudget > requiredCat.baseWeeklyBudget
                            ? 'text-[#84BA80]'
                            : 'text-[#D4A373]'
                        }`}
                      >
                        ({requiredCat.adjustedWeeklyBudget > requiredCat.baseWeeklyBudget ? '+' : ''}
                        {currency}
                        {(requiredCat.adjustedWeeklyBudget - requiredCat.baseWeeklyBudget).toFixed(0)} rollover)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-[#8EA38A]">Spent This Week:</span>
                  <span className="text-sm font-bold text-[#7FA1B3]">
                    {currency}{requiredCat.spentThisWeek.toLocaleString()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#1C261C] h-2 rounded-full overflow-hidden border border-[#263526]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      requiredCat.spentThisWeek > requiredCat.adjustedWeeklyBudget
                        ? 'bg-[#E58080]'
                        : requiredCat.spentThisWeek > requiredCat.adjustedWeeklyBudget * 0.8
                        ? 'bg-[#D4A373]'
                        : 'bg-[#5B8296]'
                    }`}
                    style={{
                      width: `${Math.min(100, requiredCat.adjustedWeeklyBudget > 0 ? (requiredCat.spentThisWeek / requiredCat.adjustedWeeklyBudget) * 100 : 0)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#8EA38A] mt-2">
                  <span>
                    Remaining:{' '}
                    <strong
                      className={
                        requiredCat.remainingThisWeek >= 0 ? 'text-[#84BA80]' : 'text-[#E58080]'
                      }
                    >
                      {requiredCat.remainingThisWeek >= 0 ? '' : '-'}
                      {currency}{Math.abs(requiredCat.remainingThisWeek).toFixed(2)}
                    </strong>
                  </span>
                  <span>
                    Month: {currency}{requiredCat.spentThisMonthToDate.toFixed(0)} / {currency}{requiredCat.monthlyBudget}
                  </span>
                </div>
              </div>

              {/* Subcategories Breakdown */}
              <div className="space-y-2 mt-4">
                <span className="text-[10px] font-bold text-[#8EA38A] uppercase tracking-wider block">
                  Required Subcategories
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {requiredCat.subcategories.filter((s) => s && s.subcategory).length === 0 ? (
                    <div className="p-3 text-center bg-[#141C14] rounded-xl border border-[#243224] text-[11px] text-[#8EA38A]">
                      No subcategories added yet.
                    </div>
                  ) : (
                    requiredCat.subcategories.filter((s) => s && s.subcategory).map((sub) => (
                    <div
                      key={sub.subcategory.id}
                      onClick={() => onQuickAddExpense('required', sub.subcategory.id)}
                      className="p-2.5 rounded-xl bg-[#141C14] hover:bg-[#1C271C] border border-[#243324] hover:border-[#384D38] transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-[#8EA38A]">
                          {ICON_MAP[sub.subcategory.iconName] || <Receipt className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-[#E8EFE6] truncate">{sub.subcategory.name}</div>
                          <div className="text-[10px] text-[#8EA38A]">
                            {currency}{(sub.spentThisWeek ?? 0).toFixed(0)} / {currency}{(sub.adjustedWeeklyBudget ?? 0).toFixed(0)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold ${
                            (sub.remainingThisWeek ?? 0) >= 0 ? 'text-[#84BA80]' : 'text-[#E58080]'
                          }`}
                        >
                          {(sub.remainingThisWeek ?? 0) >= 0 ? '+' : ''}
                          {currency}{(sub.remainingThisWeek ?? 0).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. DISCRETIONARY CATEGORY CARD (WARM BEIGE / WALNUT BROWN) */}
        {/* ========================================================================= */}
        {discretionaryCat && (
          <div className="bg-[#182318] border border-[#2D3E2D] rounded-2xl p-5 shadow-sm flex flex-col justify-between text-[#E8EFE6]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#263526]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#2A231C] border border-[#483A2E] text-[#D4A373] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#F4F8F3] text-base">Discretionary Fun</h3>
                    <p className="text-[11px] text-[#8EA38A]">Dining Out, Coffee, Entertainment, Shopping</p>
                  </div>
                </div>
                <button
                  onClick={() => onQuickAddExpense('discretionary')}
                  className="p-2 rounded-xl bg-[#223022] hover:bg-[#2C3E2C] text-[#A8BEA4] hover:text-[#F4F8F3] transition"
                  title="Add Discretionary Expense"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Weekly Budget vs Spent Summary */}
              <div className="my-4 p-3.5 bg-[#121912] rounded-xl border border-[#233123]">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs text-[#8EA38A]">Week Budget:</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#F4F8F3]">
                      {currency}{discretionaryCat.adjustedWeeklyBudget.toLocaleString()}
                    </span>
                    {discretionaryCat.adjustedWeeklyBudget !== discretionaryCat.baseWeeklyBudget && (
                      <span
                        className={`text-[10px] ml-1.5 font-medium ${
                          discretionaryCat.adjustedWeeklyBudget > discretionaryCat.baseWeeklyBudget
                            ? 'text-[#84BA80]'
                            : 'text-[#D4A373]'
                        }`}
                      >
                        ({discretionaryCat.adjustedWeeklyBudget > discretionaryCat.baseWeeklyBudget ? '+' : ''}
                        {currency}
                        {(discretionaryCat.adjustedWeeklyBudget - discretionaryCat.baseWeeklyBudget).toFixed(0)} rollover)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-[#8EA38A]">Spent This Week:</span>
                  <span className="text-sm font-bold text-[#D4A373]">
                    {currency}{discretionaryCat.spentThisWeek.toLocaleString()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#1C261C] h-2 rounded-full overflow-hidden border border-[#263526]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      discretionaryCat.spentThisWeek > discretionaryCat.adjustedWeeklyBudget
                        ? 'bg-[#E58080]'
                        : discretionaryCat.spentThisWeek > discretionaryCat.adjustedWeeklyBudget * 0.8
                        ? 'bg-[#D4A373]'
                        : 'bg-[#A26A42]'
                    }`}
                    style={{
                      width: `${Math.min(100, discretionaryCat.adjustedWeeklyBudget > 0 ? (discretionaryCat.spentThisWeek / discretionaryCat.adjustedWeeklyBudget) * 100 : 0)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#8EA38A] mt-2">
                  <span>
                    Remaining:{' '}
                    <strong
                      className={
                        discretionaryCat.remainingThisWeek >= 0 ? 'text-[#84BA80]' : 'text-[#E58080]'
                      }
                    >
                      {discretionaryCat.remainingThisWeek >= 0 ? '' : '-'}
                      {currency}{Math.abs(discretionaryCat.remainingThisWeek).toFixed(2)}
                    </strong>
                  </span>
                  <span>
                    Month: {currency}{discretionaryCat.spentThisMonthToDate.toFixed(0)} / {currency}{discretionaryCat.monthlyBudget}
                  </span>
                </div>
              </div>

              {/* Subcategories Breakdown */}
              <div className="space-y-2 mt-4">
                <span className="text-[10px] font-bold text-[#8EA38A] uppercase tracking-wider block">
                  Discretionary Subcategories
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {discretionaryCat.subcategories.filter((s) => s && s.subcategory).length === 0 ? (
                    <div className="p-3 text-center bg-[#141C14] rounded-xl border border-[#243224] text-[11px] text-[#8EA38A]">
                      No subcategories added yet.
                    </div>
                  ) : (
                    discretionaryCat.subcategories.filter((s) => s && s.subcategory).map((sub) => (
                    <div
                      key={sub.subcategory.id}
                      onClick={() => onQuickAddExpense('discretionary', sub.subcategory.id)}
                      className="p-2.5 rounded-xl bg-[#141C14] hover:bg-[#1C271C] border border-[#243324] hover:border-[#384D38] transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-[#D4A373]">
                          {ICON_MAP[sub.subcategory.iconName] || <Sparkles className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-[#E8EFE6] truncate">{sub.subcategory.name}</div>
                          <div className="text-[10px] text-[#8EA38A]">
                            {currency}{(sub.spentThisWeek ?? 0).toFixed(0)} / {currency}{(sub.adjustedWeeklyBudget ?? 0).toFixed(0)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold ${
                            (sub.remainingThisWeek ?? 0) >= 0 ? 'text-[#84BA80]' : 'text-[#E58080]'
                          }`}
                        >
                          {(sub.remainingThisWeek ?? 0) >= 0 ? '+' : ''}
                          {currency}{(sub.remainingThisWeek ?? 0).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. RESERVE CATEGORY CARD (FOREST GREEN / SAGE) */}
        {/* ========================================================================= */}
        {reservedCat && (
          <div className="bg-[#182318] border border-[#2D3E2D] rounded-2xl p-5 shadow-sm flex flex-col justify-between text-[#E8EFE6]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#263526]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1D2B1D] border border-[#314631] text-[#84BA80] flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#F4F8F3] text-base">Reserve & Sinking</h3>
                    <p className="text-[11px] text-[#8EA38A]">Emergency, Vacation, Car Repair, Investments</p>
                  </div>
                </div>
                <button
                  onClick={() => onQuickAddExpense('reserved')}
                  className="p-2 rounded-xl bg-[#223022] hover:bg-[#2C3E2C] text-[#A8BEA4] hover:text-[#F4F8F3] transition"
                  title="Add Reserve Expense"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Weekly Budget vs Spent Summary */}
              <div className="my-4 p-3.5 bg-[#121912] rounded-xl border border-[#233123]">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs text-[#8EA38A]">Week Target:</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#F4F8F3]">
                      {currency}{(reservedCat.adjustedWeeklyBudget ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-[#8EA38A]">Allocated This Week:</span>
                  <span className="text-sm font-bold text-[#84BA80]">
                    {currency}{(reservedCat.spentThisWeek ?? 0).toLocaleString()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#1C261C] h-2 rounded-full overflow-hidden border border-[#263526]">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-[#4E684C]"
                    style={{
                      width: `${Math.min(100, (reservedCat.adjustedWeeklyBudget ?? 0) > 0 ? ((reservedCat.spentThisWeek ?? 0) / reservedCat.adjustedWeeklyBudget) * 100 : 0)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#8EA38A] mt-2">
                  <span>
                    Reserve Net:{' '}
                    <strong className="text-[#84BA80]">
                      {currency}{(reservedCat.spentThisWeek ?? 0).toFixed(2)}
                    </strong>
                  </span>
                  <span>
                    Month Target: {currency}{reservedCat.monthlyBudget}
                  </span>
                </div>
              </div>

              {/* Subcategories Breakdown */}
              <div className="space-y-2 mt-4">
                <span className="text-[10px] font-bold text-[#8EA38A] uppercase tracking-wider block">
                  Reserve Funds
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {reservedCat.subcategories.filter((s) => s && s.subcategory).length === 0 ? (
                    <div className="p-3 text-center bg-[#141C14] rounded-xl border border-[#243224] text-[11px] text-[#8EA38A]">
                      No subcategories added yet.
                    </div>
                  ) : (
                    reservedCat.subcategories.filter((s) => s && s.subcategory).map((sub) => (
                    <div
                      key={sub.subcategory.id}
                      onClick={() => onQuickAddExpense('reserved', sub.subcategory.id)}
                      className="p-2.5 rounded-xl bg-[#141C14] hover:bg-[#1C271C] border border-[#243324] hover:border-[#384D38] transition cursor-pointer flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-[#84BA80]">
                          {ICON_MAP[sub.subcategory.iconName] || <Shield className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-[#E8EFE6] truncate">{sub.subcategory.name}</div>
                          <div className="text-[10px] text-[#8EA38A]">
                            Fund Target: {currency}{(sub.adjustedWeeklyBudget ?? 0).toFixed(0)}/wk
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#84BA80]">
                          {currency}{(sub.spentThisWeek ?? 0).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
