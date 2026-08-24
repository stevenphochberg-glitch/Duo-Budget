export type SpendingType = 'fixed' | 'variable' | 'hybrid';

export type MainCategoryKey = 'required' | 'discretionary' | 'reserved';

export interface Partner {
  id: string;
  name: string;
  avatarEmoji: string;
  color: string;
}

export interface SubcategoryConfig {
  id: string;
  name: string;
  mainCategory: MainCategoryKey;
  spendingType: SpendingType;
  targetMonthlyBudget: number;
  fixedBaseAmount?: number; // for hybrid: minimum fixed portion
  description?: string;
  iconName: string;
}

export interface Transaction {
  id: string;
  householdId: string;
  partnerId: string;
  partnerName: string;
  mainCategory: MainCategoryKey;
  subcategoryId?: string; // Optional for discretionary
  subcategoryName?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note: string;
  spendingType: SpendingType;
  isFixedBaseAllocation?: boolean;
  reactions: Record<string, string[]>; // partnerId -> array of emojis like ["💸", "❤️"]
  createdAt: number;
}

export interface WeekGamble {
  id: string;
  householdId: string;
  partnerId?: string; // specific partner or couple joint
  weekNumber: number; // 1, 2, 3, 4, 5
  monthKey: string; // "2026-08" or "2026-F08"
  overspentAmount: number;
  gambleAmount: number;
  status: 'active' | 'won' | 'lost';
  createdAt: number;
  resolvedAt?: number;
  scoreImpact?: number; // +50% of gamble if won, -50% if lost
  notes?: string;
}

export interface WeekScoreRecord {
  weekNumber: number;
  monthKey: string;
  weekLabel: string;
  totalBudget: number;
  totalSpent: number;
  netDiff: number; // positive = underspent, negative = overspent
  basePoints: number;
  streakWeekCount: number;
  streakBonusPercent: number;
  streakBonusPoints: number;
  gambleImpact: number;
  totalWeekScore: number;
  evaluatedAt: number;
}

export interface IncomeSettings {
  totalMonthlyIncome: number;
  partner1Income: number;
  partner2Income: number;
  splitMode: 'joint' | 'individual';
}

export interface ParentCategoryBudget {
  required: number;
  discretionary: number;
  reserved: number;
}

export interface RedemptionTask {
  id: string;
  title: string;
  description: string;
  pointsRestored: number;
  completed: boolean;
  completedAt?: number;
  completedByPartnerId?: string;
}

export interface NegativeSponge {
  id: string;
  title: string;
  reason: string;
  weekNumber: number;
  monthKey: string;
  overspentAmount: number;
  penaltyPoints: number;
  status: 'active' | 'expunged';
  createdAt: number;
  expungedAt?: number;
  tasks: RedemptionTask[];
}

export interface GamificationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'budget' | 'gamble' | 'sponge_cleanse' | 'collaboration';
  unlockedAt?: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsReward?: number;
}

export interface HouseholdSettings {
  calendarMode: 'calendar' | 'fiscal';
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday, 6 = Saturday
  currencySymbol: string;
  income: IncomeSettings;
  parentBudgets: ParentCategoryBudget;
  partner1: Partner;
  partner2: Partner;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: number;
  settings: HouseholdSettings;
  subcategories: SubcategoryConfig[];
  score: {
    totalPoints: number;
    currentStreakWeeks: number;
    bestStreakWeeks: number;
    history: WeekScoreRecord[];
  };
  gambles: WeekGamble[];
  sponges?: NegativeSponge[];
  unlockedBadgeIds?: string[];
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  partnerId: string; // 'partner1' or 'partner2'
  householdId: string;
  passwordHash: string;
}

export interface WeekDateRange {
  weekNumber: number;
  label: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface SubcategoryWeekStatus {
  subcategory: SubcategoryConfig;
  monthlyBudget: number;
  baseWeeklyBudget: number;
  adjustedWeeklyBudget: number;
  spentThisWeek: number;
  spentThisMonthToDate: number;
  remainingThisWeek: number;
  rolloverAdjustmentFromPrevWeeks: number;
  fixedBaseAllocated: number;
  variableSpent: number;
}

export interface CategoryWeekStatus {
  categoryKey: MainCategoryKey;
  categoryTitle: string;
  monthlyBudget: number;
  baseWeeklyBudget: number;
  adjustedWeeklyBudget: number;
  spentThisWeek: number;
  spentThisMonthToDate: number;
  remainingThisWeek: number;
  subcategories: SubcategoryWeekStatus[];
}

export interface MonthPeriodData {
  monthKey: string;
  monthTitle: string;
  totalWeeksInMonth: number;
  currentWeekIndex: number;
  weeks: WeekDateRange[];
  calendarMode: 'calendar' | 'fiscal';
}

export interface ChatMessage {
  id: string;
  householdId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  content?: string;
  gifUrl?: string;
  gifTitle?: string;
  attachedTransaction?: Transaction;
  reactions?: Record<string, string[]>;
  createdAt: number;
}
