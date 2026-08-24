import {
  CategoryWeekStatus,
  HouseholdSettings,
  MainCategoryKey,
  MonthPeriodData,
  SubcategoryConfig,
  SubcategoryWeekStatus,
  Transaction,
  WeekDateRange,
  WeekGamble,
  WeekScoreRecord,
} from '../types';

export const DEFAULT_SUBCATEGORIES: SubcategoryConfig[] = [
  // Required
  {
    id: 'rent',
    name: 'Rent / Mortgage',
    mainCategory: 'required',
    spendingType: 'fixed',
    targetMonthlyBudget: 1800,
    iconName: 'Home',
    description: 'Fixed monthly housing payment',
  },
  {
    id: 'bills',
    name: 'Bills (Internet, Cell, Insurance)',
    mainCategory: 'required',
    spendingType: 'hybrid',
    targetMonthlyBudget: 280,
    fixedBaseAmount: 180, // Minimum fixed internet & phone base
    iconName: 'Receipt',
    description: 'Hybrid: fixed base + variable bills',
  },
  {
    id: 'utilities',
    name: 'Utilities (Electric, Water, Gas)',
    mainCategory: 'required',
    spendingType: 'hybrid',
    targetMonthlyBudget: 240,
    fixedBaseAmount: 100,
    iconName: 'Zap',
    description: 'Hybrid: seasonal power & water',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions (Streaming, Cloud)',
    mainCategory: 'required',
    spendingType: 'fixed',
    targetMonthlyBudget: 75,
    iconName: 'Tv',
    description: 'Recurring monthly subscriptions',
  },
  {
    id: 'groceries',
    name: 'Groceries & Household Essentials',
    mainCategory: 'required',
    spendingType: 'variable',
    targetMonthlyBudget: 800,
    iconName: 'ShoppingCart',
    description: 'Weekly grocery runs & supplies',
  },
  {
    id: 'gas',
    name: 'Gas & Transit',
    mainCategory: 'required',
    spendingType: 'variable',
    targetMonthlyBudget: 220,
    iconName: 'Fuel',
    description: 'Gas tank refills & public transit',
  },
  {
    id: 'car_payment',
    name: 'Car Payment',
    mainCategory: 'required',
    spendingType: 'fixed',
    targetMonthlyBudget: 420,
    iconName: 'Car',
    description: 'Fixed monthly auto financing',
  },

  // Discretionary
  {
    id: 'discretionary_fun',
    name: 'Discretionary (Fun Spending)',
    mainCategory: 'discretionary',
    spendingType: 'variable',
    targetMonthlyBudget: 600,
    iconName: 'Sparkles',
    description: 'Dining out, coffee, hobbies, entertainment',
  },

  // Reserved
  {
    id: 'down_payment',
    name: 'Down Payment Fund',
    mainCategory: 'reserved',
    spendingType: 'fixed',
    targetMonthlyBudget: 500,
    iconName: 'Landmark',
    description: 'Reserved savings for house down payment',
  },
  {
    id: 'emergency_fund',
    name: 'Emergency Fund',
    mainCategory: 'reserved',
    spendingType: 'fixed',
    targetMonthlyBudget: 300,
    iconName: 'ShieldAlert',
    description: '3-6 months safety buffer',
  },
  {
    id: 'investing',
    name: 'Investing (Roth IRA / Index)',
    mainCategory: 'reserved',
    spendingType: 'variable',
    targetMonthlyBudget: 400,
    iconName: 'TrendingUp',
    description: 'Long-term wealth & retirement accounts',
  },
  {
    id: 'debt_payment',
    name: 'Debt Payment (Student / Extra)',
    mainCategory: 'reserved',
    spendingType: 'fixed',
    targetMonthlyBudget: 250,
    iconName: 'CreditCard',
    description: 'Principal loan payoff acceleration',
  },
];

/**
 * Format a Date to YYYY-MM-DD in local time
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateISO(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Generates weeks for a given month based on Calendar vs Fiscal settings
 */
export function getMonthPeriodData(
  year: number,
  monthIndex: number, // 0-11
  settings: HouseholdSettings,
  referenceDate: Date = new Date()
): MonthPeriodData {
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthTitle = `${monthNames[monthIndex]} ${year}`;
  const todayStr = formatDateISO(referenceDate);

  const weeks: WeekDateRange[] = [];

  if (settings.calendarMode === 'calendar') {
    // Calendar month: from 1st to last day of month
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0); // last day of month
    const totalDays = lastDay.getDate();

    let currentStartDay = 1;
    let weekNum = 1;

    while (currentStartDay <= totalDays) {
      const curDate = new Date(year, monthIndex, currentStartDay);
      // find next boundary based on firstDayOfWeek or end of month
      // if firstDayOfWeek is e.g. 1 (Monday), week ends on Sunday (day 0 or (1+6)%7)
      let endDayNum = currentStartDay;
      while (endDayNum < totalDays) {
        const nextDate = new Date(year, monthIndex, endDayNum + 1);
        if (nextDate.getDay() === settings.firstDayOfWeek) {
          break;
        }
        endDayNum++;
      }

      const wStartDate = new Date(year, monthIndex, currentStartDay);
      const wEndDate = new Date(year, monthIndex, endDayNum);
      const startStr = formatDateISO(wStartDate);
      const endStr = formatDateISO(wEndDate);

      const isCurrent = todayStr >= startStr && todayStr <= endStr;
      const isPast = todayStr > endStr;
      const isFuture = todayStr < startStr;

      weeks.push({
        weekNumber: weekNum,
        label: `Week ${weekNum} (${monthNames[monthIndex].slice(0, 3)} ${currentStartDay} - ${endDayNum})`,
        startDate: startStr,
        endDate: endStr,
        isCurrent,
        isPast,
        isFuture,
      });

      currentStartDay = endDayNum + 1;
      weekNum++;
    }
  } else {
    // Fiscal month: 4 or 5 clean 7-day blocks aligned with firstDayOfWeek
    // Find the first occurrence of firstDayOfWeek on or before the 1st of the month
    const firstOfMonth = new Date(year, monthIndex, 1);
    let startDayOffset = firstOfMonth.getDay() - settings.firstDayOfWeek;
    if (startDayOffset < 0) startDayOffset += 7;
    const fiscalStartDate = new Date(year, monthIndex, 1 - startDayOffset);

    // Standard 4 weeks for normal months, 5 weeks every quarter/longer months
    const lastOfMonth = new Date(year, monthIndex + 1, 0);
    const daysInFiscalSpan = Math.ceil((lastOfMonth.getTime() - fiscalStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = daysInFiscalSpan > 28 ? 5 : 4;

    for (let w = 1; w <= totalWeeks; w++) {
      const wStart = new Date(fiscalStartDate);
      wStart.setDate(wStart.getDate() + (w - 1) * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);

      const startStr = formatDateISO(wStart);
      const endStr = formatDateISO(wEnd);

      const isCurrent = todayStr >= startStr && todayStr <= endStr;
      const isPast = todayStr > endStr;
      const isFuture = todayStr < startStr;

      weeks.push({
        weekNumber: w,
        label: `Fiscal Week ${w} (${wStart.getMonth() + 1}/${wStart.getDate()} - ${wEnd.getMonth() + 1}/${wEnd.getDate()})`,
        startDate: startStr,
        endDate: endStr,
        isCurrent,
        isPast,
        isFuture,
      });
    }
  }

  // Determine current week index
  let currentWeekIndex = weeks.findIndex((w) => w.isCurrent);
  if (currentWeekIndex === -1) {
    if (todayStr > weeks[weeks.length - 1].endDate) {
      currentWeekIndex = weeks.length - 1;
    } else {
      currentWeekIndex = 0;
    }
  }

  return {
    monthKey,
    monthTitle,
    totalWeeksInMonth: weeks.length,
    currentWeekIndex,
    weeks,
    calendarMode: settings.calendarMode,
  };
}

/**
 * Calculates dynamic weekly budget rollover for every subcategory across the month.
 *
 * Rule:
 * Base Weekly Budget = MonthlyBudget / TotalWeeks
 * In Week 1: Allocated = Base
 * In Week K: If prior weeks spent S_prior, Remaining for rest of month = MonthlyBudget - S_prior.
 * Allocated for Week K = Remaining / (TotalWeeks - (K - 1)).
 * Rollover difference = Allocated - Base.
 */
export function calculateWeeklyBudgetStatuses(
  subcategories: SubcategoryConfig[],
  transactions: Transaction[],
  monthData: MonthPeriodData,
  selectedWeekNumber: number,
  settings?: HouseholdSettings
): {
  categories: CategoryWeekStatus[];
  totalMonthlyBudget: number;
  totalWeeklyAdjustedBudget: number;
  totalSpentThisWeek: number;
  totalSpentThisMonth: number;
  totalRemainingThisWeek: number;
  weekDiff: number; // positive = underspent, negative = overspent
} {
  const totalWeeks = monthData.totalWeeksInMonth;
  const currentWeek = monthData.weeks.find((w) => w.weekNumber === selectedWeekNumber) || monthData.weeks[0];

  // Group transactions for current month (ignoring any legacy manual transactions on fixed categories)
  const allMonthTransactions = transactions.filter((t) => {
    return (
      t.spendingType !== 'fixed' &&
      t.date >= monthData.weeks[0].startDate &&
      t.date <= monthData.weeks[monthData.weeks.length - 1].endDate
    );
  });

  const weekTransactions = allMonthTransactions.filter((t) => {
    return t.date >= currentWeek.startDate && t.date <= currentWeek.endDate;
  });

  // Calculate prior weeks' spend for each subcategory
  const priorWeeks = monthData.weeks.filter((w) => w.weekNumber < selectedWeekNumber);
  const priorTransactions = allMonthTransactions.filter((t) => {
    return priorWeeks.some((pw) => t.date >= pw.startDate && t.date <= pw.endDate);
  });

  const subcategoryStatuses: Record<string, SubcategoryWeekStatus> = {};

  for (const sub of subcategories) {
    const monthlyBudget = sub.targetMonthlyBudget;
    const baseWeeklyBudget = Number((monthlyBudget / totalWeeks).toFixed(2));
    const remainingWeeksCount = Math.max(1, totalWeeks - (selectedWeekNumber - 1));

    if (sub.spendingType === 'fixed') {
      // FIXED COST RULE:
      // Automatically logged and prorated for each week. Not manually loggable.
      const weeklyFixedProrated = baseWeeklyBudget;
      const spentThisWeek = weeklyFixedProrated;
      const spentThisMonthToDate = Number((selectedWeekNumber * weeklyFixedProrated).toFixed(2));
      const adjustedWeeklyBudget = baseWeeklyBudget;
      const remainingThisWeek = 0; // Fully allocated and accounted for

      subcategoryStatuses[sub.id] = {
        subcategory: sub,
        monthlyBudget,
        baseWeeklyBudget,
        adjustedWeeklyBudget,
        spentThisWeek,
        spentThisMonthToDate,
        remainingThisWeek,
        rolloverAdjustmentFromPrevWeeks: 0,
        fixedBaseAllocated: weeklyFixedProrated,
        variableSpent: 0,
      };
    } else if (sub.spendingType === 'hybrid') {
      // HYBRID COST RULE:
      // Minimum fixed base amount is prorated and automatically logged for each week.
      // Additional variable expenses are manually logged and subject to dynamic rollover.
      const fixedBaseMonthly = Math.min(monthlyBudget, sub.fixedBaseAmount || 0);
      const variableMonthly = Math.max(0, monthlyBudget - fixedBaseMonthly);

      const weeklyFixedBase = Number((fixedBaseMonthly / totalWeeks).toFixed(2));
      const baseWeeklyVariable = Number((variableMonthly / totalWeeks).toFixed(2));

      // Prior variable transactions
      const priorVarSpent = priorTransactions
        .filter((t) => (sub.mainCategory === 'discretionary' ? t.mainCategory === 'discretionary' : t.subcategoryId === sub.id))
        .reduce((sum, t) => sum + t.amount, 0);

      const remainingVarMonth = Math.max(0, variableMonthly - priorVarSpent);

      let adjustedWeeklyVar = baseWeeklyVariable;
      if (selectedWeekNumber > 1) {
        adjustedWeeklyVar = Number((remainingVarMonth / remainingWeeksCount).toFixed(2));
      }

      const adjustedWeeklyBudget = Number((weeklyFixedBase + adjustedWeeklyVar).toFixed(2));
      const rolloverAdjustment = Number((adjustedWeeklyBudget - baseWeeklyBudget).toFixed(2));

      // Variable spent this week from manual logs
      const manualVarWeek = weekTransactions
        .filter((t) => (sub.mainCategory === 'discretionary' ? t.mainCategory === 'discretionary' : t.subcategoryId === sub.id))
        .reduce((sum, t) => sum + t.amount, 0);

      const manualVarMonthToDate = allMonthTransactions
        .filter((t) => (sub.mainCategory === 'discretionary' ? t.mainCategory === 'discretionary' : t.subcategoryId === sub.id))
        .reduce((sum, t) => sum + t.amount, 0);

      // Total spent = auto-prorated fixed base + manual variable expenses
      const spentThisWeek = Number((weeklyFixedBase + manualVarWeek).toFixed(2));
      const spentThisMonthToDate = Number(((selectedWeekNumber * weeklyFixedBase) + manualVarMonthToDate).toFixed(2));
      const remainingThisWeek = Number((adjustedWeeklyBudget - spentThisWeek).toFixed(2));

      subcategoryStatuses[sub.id] = {
        subcategory: sub,
        monthlyBudget,
        baseWeeklyBudget,
        adjustedWeeklyBudget,
        spentThisWeek,
        spentThisMonthToDate,
        remainingThisWeek,
        rolloverAdjustmentFromPrevWeeks: rolloverAdjustment,
        fixedBaseAllocated: weeklyFixedBase,
        variableSpent: manualVarWeek,
      };
    } else {
      // VARIABLE COST RULE:
      // Completely driven by manual expenses with dynamic rollover
      const priorSpent = priorTransactions
        .filter((t) => (sub.mainCategory === 'discretionary' ? t.mainCategory === 'discretionary' : t.subcategoryId === sub.id))
        .reduce((sum, t) => sum + t.amount, 0);

      const remainingMonthBudget = Math.max(0, monthlyBudget - priorSpent);

      let adjustedWeeklyBudget = baseWeeklyBudget;
      if (selectedWeekNumber > 1) {
        adjustedWeeklyBudget = Number((remainingMonthBudget / remainingWeeksCount).toFixed(2));
      }

      const rolloverAdjustment = Number((adjustedWeeklyBudget - baseWeeklyBudget).toFixed(2));

      const thisWeekTrans = weekTransactions.filter((t) =>
        sub.mainCategory === 'discretionary' ? t.mainCategory === 'discretionary' : t.subcategoryId === sub.id
      );
      const spentThisWeek = Number(thisWeekTrans.reduce((sum, t) => sum + t.amount, 0).toFixed(2));

      const monthTrans = allMonthTransactions.filter((t) =>
        sub.mainCategory === 'discretionary' ? t.mainCategory === 'discretionary' : t.subcategoryId === sub.id
      );
      const spentThisMonthToDate = Number(monthTrans.reduce((sum, t) => sum + t.amount, 0).toFixed(2));

      const remainingThisWeek = Number((adjustedWeeklyBudget - spentThisWeek).toFixed(2));

      subcategoryStatuses[sub.id] = {
        subcategory: sub,
        monthlyBudget,
        baseWeeklyBudget,
        adjustedWeeklyBudget,
        spentThisWeek,
        spentThisMonthToDate,
        remainingThisWeek,
        rolloverAdjustmentFromPrevWeeks: rolloverAdjustment,
        fixedBaseAllocated: 0,
        variableSpent: spentThisWeek,
      };
    }
  }

  // Aggregate into 3 main categories
  const mainCatKeys: { key: MainCategoryKey; title: string }[] = [
    { key: 'required', title: 'Required Spending' },
    { key: 'discretionary', title: 'Discretionary (Fun)' },
    { key: 'reserved', title: 'Reserved & Savings' },
  ];

  const categories: CategoryWeekStatus[] = mainCatKeys.map(({ key, title }) => {
    const subs = subcategories.filter((s) => s.mainCategory === key);
    const subStatuses = subs.map((s) => subcategoryStatuses[s.id]);

    const monthlyBudget = subStatuses.reduce((sum, s) => sum + s.monthlyBudget, 0);
    const baseWeeklyBudget = Number(subStatuses.reduce((sum, s) => sum + s.baseWeeklyBudget, 0).toFixed(2));
    const adjustedWeeklyBudget = Number(subStatuses.reduce((sum, s) => sum + s.adjustedWeeklyBudget, 0).toFixed(2));
    const spentThisWeek = Number(subStatuses.reduce((sum, s) => sum + s.spentThisWeek, 0).toFixed(2));
    const spentThisMonthToDate = Number(subStatuses.reduce((sum, s) => sum + s.spentThisMonthToDate, 0).toFixed(2));
    const remainingThisWeek = Number((adjustedWeeklyBudget - spentThisWeek).toFixed(2));

    return {
      categoryKey: key,
      categoryTitle: title,
      monthlyBudget,
      baseWeeklyBudget,
      adjustedWeeklyBudget,
      spentThisWeek,
      spentThisMonthToDate,
      remainingThisWeek,
      subcategories: subStatuses,
    };
  });

  const totalMonthlyBudget = categories.reduce((sum, c) => sum + c.monthlyBudget, 0);
  const totalWeeklyAdjustedBudget = Number(categories.reduce((sum, c) => sum + c.adjustedWeeklyBudget, 0).toFixed(2));
  const totalSpentThisWeek = Number(categories.reduce((sum, c) => sum + c.spentThisWeek, 0).toFixed(2));
  const totalSpentThisMonth = Number(categories.reduce((sum, c) => sum + c.spentThisMonthToDate, 0).toFixed(2));
  const totalRemainingThisWeek = Number((totalWeeklyAdjustedBudget - totalSpentThisWeek).toFixed(2));
  const weekDiff = totalRemainingThisWeek;

  return {
    categories,
    totalMonthlyBudget,
    totalWeeklyAdjustedBudget,
    totalSpentThisWeek,
    totalSpentThisMonth,
    totalRemainingThisWeek,
    weekDiff,
  };
}

/**
 * Calculate gamification score for a week
 * Rule:
 * - Underspend: +Score equal to net underspend.
 * - Underspend Streak: 2 weeks in a row adds +5% of underspend.
 *   Each consecutive week adds another +5% (Week 2 = 5%, Week 3 = 10%, Week 4 = 15%, Week N = (N-1)*5%).
 * - Overspend: -Score equal to net overspend. Streak resets to 0.
 */
export function evaluateWeekGamification(
  weekDiff: number, // positive = underspend, negative = overspend
  previousStreak: number
): {
  basePoints: number;
  newStreak: number;
  streakBonusPercent: number;
  streakBonusPoints: number;
  totalPointsEarned: number;
} {
  if (weekDiff >= 0) {
    const basePoints = Math.round(weekDiff);
    const newStreak = previousStreak + 1;
    // Streak bonus starts at 2 weeks in a row (5%), then +5% for each extra week
    const streakBonusPercent = newStreak >= 2 ? (newStreak - 1) * 5 : 0;
    const streakBonusPoints = Math.round(basePoints * (streakBonusPercent / 100));
    const totalPointsEarned = basePoints + streakBonusPoints;

    return {
      basePoints,
      newStreak,
      streakBonusPercent,
      streakBonusPoints,
      totalPointsEarned,
    };
  } else {
    // Overspent
    const overspent = Math.abs(weekDiff);
    const basePoints = -Math.round(overspent);
    return {
      basePoints,
      newStreak: 0, // resets streak
      streakBonusPercent: 0,
      streakBonusPoints: 0,
      totalPointsEarned: basePoints,
    };
  }
}

/**
 * Resolve gambles for a finished month
 * If monthly net spend <= monthly budget: won -> +50% of gamble
 * If monthly net spend > monthly budget: lost -> -50% of gamble (decreases negative score by another 50%)
 */
export function resolveGambleOutcome(
  gamble: WeekGamble,
  totalMonthlyBudget: number,
  totalMonthlySpend: number
): {
  status: 'won' | 'lost';
  scoreImpact: number;
  explanation: string;
} {
  const isRecovered = totalMonthlySpend <= totalMonthlyBudget;
  const gambleVal = gamble.gambleAmount;

  if (isRecovered) {
    const reward = Math.round(gambleVal * 0.5);
    return {
      status: 'won',
      scoreImpact: reward,
      explanation: `Gamble Won! Finished the month within the $${totalMonthlyBudget} budget (Spent: $${totalMonthlySpend}). Earned +50% bonus (+${reward} pts).`,
    };
  } else {
    const penalty = -Math.round(gambleVal * 0.5);
    return {
      status: 'lost',
      scoreImpact: penalty,
      explanation: `Gamble Lost. Month total spend ($${totalMonthlySpend}) exceeded budget ($${totalMonthlyBudget}). Score reduced by 50% penalty (${penalty} pts).`,
    };
  }
}
