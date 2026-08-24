import React from 'react';
import {
  X,
  BarChart3,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  RefreshCw,
  Info,
  Leaf,
} from 'lucide-react';
import {
  CategoryWeekStatus,
  Household,
  MonthPeriodData,
  SubcategoryConfig,
  Transaction,
} from '../types';
import { calculateWeeklyBudgetStatuses } from '../utils/budgetCalculations';

interface MonthOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  subcategories: SubcategoryConfig[];
  transactions: Transaction[];
  monthData: MonthPeriodData;
  currency: string;
  onSelectWeek: (weekNum: number) => void;
}

export const MonthOverviewModal: React.FC<MonthOverviewModalProps> = ({
  isOpen,
  onClose,
  household,
  subcategories,
  transactions,
  monthData,
  currency,
  onSelectWeek,
}) => {
  if (!isOpen) return null;

  // Calculate stats for all weeks in the month
  const weekSummaries = monthData.weeks.map((w) => {
    const stats = calculateWeeklyBudgetStatuses(
      subcategories,
      transactions,
      monthData,
      w.weekNumber
    );
    return {
      week: w,
      stats,
    };
  });

  const totalMonthlyBudget = weekSummaries[0]?.stats.totalMonthlyBudget || 0;
  const latestStats = weekSummaries[weekSummaries.length - 1]?.stats;
  const monthTotalSpent = latestStats?.totalSpentThisMonth || 0;
  const monthNetDiff = totalMonthlyBudget - monthTotalSpent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0D120D]">
      <div className="bg-[#161F16] border border-[#2F3E2F] text-[#E8EFE6] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C3B2C] flex items-center justify-between bg-[#121912]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#243324] border border-[#3C523C] text-[#8EA38A] flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#F4F8F3] flex items-center gap-2">
                <span>{monthData.monthTitle} Multi-Week Dynamic Flow</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1C271C] text-[#8EA38A] border border-[#304030] font-mono">
                  {monthData.totalWeeksInMonth} Weeks
                </span>
              </h2>
              <p className="text-xs text-[#8EA38A]">
                Weekly budget allocations dynamic progression across {monthData.monthTitle}
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Monthly High-Level Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1B251B] rounded-2xl border border-[#314231]">
              <span className="text-xs text-[#8EA38A] uppercase tracking-wider block mb-1">
                Month Total Target
              </span>
              <span className="text-2xl font-serif font-bold text-[#F4F8F3]">
                {currency}{totalMonthlyBudget.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-[#1B251B] rounded-2xl border border-[#314231]">
              <span className="text-xs text-[#8EA38A] uppercase tracking-wider block mb-1">
                Month Spent to Date
              </span>
              <span className="text-2xl font-serif font-bold text-[#7FA1B3]">
                {currency}{monthTotalSpent.toFixed(2)}
              </span>
            </div>

            <div className="p-4 bg-[#1B251B] rounded-2xl border border-[#314231]">
              <span className="text-xs text-[#8EA38A] uppercase tracking-wider block mb-1">
                Net Monthly Balance
              </span>
              <span
                className={`text-2xl font-serif font-bold ${
                  monthNetDiff >= 0 ? 'text-[#84BA80]' : 'text-[#E58080]'
                }`}
              >
                {monthNetDiff >= 0 ? '+' : '-'}{currency}{Math.abs(monthNetDiff).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Reset Rule Notice */}
          <div className="p-3.5 bg-[#141C14] rounded-xl border border-[#2A392A] text-xs text-[#8EA38A] flex items-start gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F4F8F3]">Monthly Reset Rule:</strong> Dynamic weekly budget adjustments roll over exclusively within this month. At the start of the next month, all category budgets reset cleanly to their base allocation.
            </div>
          </div>

          {/* Week-by-Week Rollover Progression */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8EA38A] uppercase tracking-wider">
              Week-by-Week Dynamic Progression
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weekSummaries.map(({ week, stats }) => {
                const isUnder = stats.totalRemainingThisWeek >= 0;
                const isCurrent = week.isCurrent;

                return (
                  <div
                    key={week.weekNumber}
                    className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-[#1E2B1E] border-[#4E684C] shadow-md'
                        : 'bg-[#182218] border-[#2A392A] hover:border-[#3C503C]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#F4F8F3] text-sm font-serif">
                          Week {week.weekNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#2E3F2E] text-[#84BA80] px-2 py-0.5 rounded-full font-bold border border-[#445E44]">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#8EA38A] mb-3">{week.label}</div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-[#8EA38A]">
                          <span>Budget:</span>
                          <span className="font-bold text-[#F4F8F3]">
                            {currency}{stats.totalAdjustedWeeklyBudget.toFixed(0)}
                          </span>
                        </div>

                        <div className="flex justify-between text-[#8EA38A]">
                          <span>Spent:</span>
                          <span className="font-bold text-[#7FA1B3]">
                            {currency}{stats.totalSpentThisWeek.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between border-t border-[#263426] pt-1.5 font-bold">
                          <span className="text-[#8EA38A]">Net Diff:</span>
                          <span className={isUnder ? 'text-[#84BA80]' : 'text-[#E58080]'}>
                            {isUnder ? '+' : ''}
                            {currency}{stats.totalRemainingThisWeek.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectWeek(week.weekNumber);
                        onClose();
                      }}
                      className="mt-4 w-full py-1.5 rounded-xl bg-[#141C14] hover:bg-[#202C20] border border-[#2B3B2B] text-xs font-bold text-[#8EA38A] hover:text-[#F4F8F3] transition flex items-center justify-center gap-1"
                    >
                      <span>Inspect Week</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2C3B2C] flex items-center justify-end bg-[#121912]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#364936] hover:bg-[#465E46] text-xs font-bold text-[#F4F8F3] transition shadow-sm"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
