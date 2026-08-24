import {
  GamificationBadge,
  Household,
  NegativeSponge,
  RedemptionTask,
} from '../types';

export interface LevelInfo {
  level: number;
  title: string;
  badge: string; // Icon identifier e.g. 'Sprout', 'Leaf', 'Home', 'Trees', 'Sun', 'Mountain'
  minPoints: number;
  maxPoints: number;
  perks: string;
  description?: string;
  nextLevelTitle?: string;
  progressPercent: number;
  pointsToNext: number;
}

export const LEVELS = [
  { level: 1, title: 'Seedling Savers', badge: 'Sprout', minPoints: 0, maxPoints: 500, perks: 'Grounding financial foundations', description: 'Beginners building mindful joint budgeting habits.' },
  { level: 2, title: 'Sprout Duo', badge: 'Leaf', minPoints: 500, maxPoints: 1500, perks: '5% bonus on consecutive streaks', description: 'Growing consistency and active weekly reviews.' },
  { level: 3, title: 'Cozy Hearth', badge: 'Flame', minPoints: 1500, maxPoints: 3000, perks: '10% bonus on weekly gambles', description: 'Harmonious couple spending with shared trust.' },
  { level: 4, title: 'Evergreen Haven', badge: 'Trees', minPoints: 3000, maxPoints: 5000, perks: 'Unlock custom redemption challenges', description: 'Resilient finances weathering unexpected bills.' },
  { level: 5, title: 'Golden Harvest', badge: 'Sun', minPoints: 5000, maxPoints: 8000, perks: 'Priority streak recovery shield', description: 'Flourishing wealth and automated sinking funds.' },
  { level: 6, title: 'Zen Sanctuary', badge: 'Mountain', minPoints: 8000, maxPoints: 99999, perks: 'Master financial autonomy & peace', description: 'Complete financial freedom, peace of mind, and shared prosperity.' },
];

export const LEVEL_TIERS = LEVELS;

export function calculateLevel(points: number): LevelInfo {
  const currentPoints = Math.max(0, points);
  let currentLevelObj = LEVELS[0];

  for (let i = 0; i < LEVELS.length; i++) {
    if (currentPoints >= LEVELS[i].minPoints) {
      currentLevelObj = LEVELS[i];
    }
  }

  const isMaxLevel = currentLevelObj.level === LEVELS[LEVELS.length - 1].level;
  const range = currentLevelObj.maxPoints - currentLevelObj.minPoints;
  const progressPoints = currentPoints - currentLevelObj.minPoints;
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.max(0, Math.round((progressPoints / range) * 100)));
  const pointsToNext = isMaxLevel ? 0 : Math.max(0, currentLevelObj.maxPoints - currentPoints);
  const nextLevel = LEVELS.find((l) => l.level === currentLevelObj.level + 1);

  return {
    level: currentLevelObj.level,
    title: currentLevelObj.title,
    badge: currentLevelObj.badge,
    minPoints: currentLevelObj.minPoints,
    maxPoints: currentLevelObj.maxPoints,
    perks: currentLevelObj.perks,
    description: currentLevelObj.description,
    nextLevelTitle: nextLevel?.title,
    progressPercent,
    pointsToNext,
  };
}

export const ALL_BADGES: GamificationBadge[] = [
  {
    id: 'first_log',
    name: 'First Step',
    description: 'Logged your first joint expense together',
    icon: 'Sprout',
    category: 'collaboration',
    tier: 'bronze',
    pointsReward: 50,
  },
  {
    id: 'under_budget_week',
    name: 'Under-Budget Ace',
    description: 'Finished a week under your adjusted weekly budget',
    icon: 'Sparkles',
    category: 'budget',
    tier: 'bronze',
    pointsReward: 100,
  },
  {
    id: 'under_budget_hero',
    name: 'Super Saver Couple',
    description: 'Finished a week with over $100 in underspent surplus',
    icon: 'Award',
    category: 'budget',
    tier: 'silver',
    pointsReward: 200,
  },
  {
    id: 'streak_2',
    name: 'Twin Sparks',
    description: 'Maintained an unbroken 2-week underspend streak',
    icon: 'Flame',
    category: 'streak',
    tier: 'bronze',
    pointsReward: 100,
  },
  {
    id: 'streak_4',
    name: 'Steady Hearth',
    description: 'Maintained a 4-week consecutive underspend streak',
    icon: 'Trees',
    category: 'streak',
    tier: 'silver',
    pointsReward: 250,
  },
  {
    id: 'streak_8',
    name: 'Everlasting Fire',
    description: 'Achieved an extraordinary 8-week financial discipline streak',
    icon: 'Sun',
    category: 'streak',
    tier: 'gold',
    pointsReward: 500,
  },
  {
    id: 'gamble_won',
    name: 'High Roller Miracle',
    description: 'Recovered an overspent week by end of month and won bonus points',
    icon: 'Coins',
    category: 'gamble',
    tier: 'gold',
    pointsReward: 300,
  },
  {
    id: 'sponge_expunged',
    name: 'Sponge Cleanser',
    description: 'Completed all partner redemption tasks to expunge an overspending sponge',
    icon: 'Shield',
    category: 'sponge_cleanse',
    tier: 'silver',
    pointsReward: 150,
  },
  {
    id: 'reserve_guardian',
    name: 'Nest Egg Guardian',
    description: 'Successfully transferred and funded full reserved monthly savings',
    icon: 'Shield',
    category: 'budget',
    tier: 'gold',
    pointsReward: 300,
  },
  {
    id: 'chat_harmony',
    name: 'Budget Harmony',
    description: 'Shared 5+ transactions into Couple Chat for transparent check-ins',
    icon: 'MessageSquare',
    category: 'collaboration',
    tier: 'bronze',
    pointsReward: 75,
  },
];

export const REDEMPTION_TASK_TEMPLATES = [
  {
    title: 'Cook 2 Cozy Dinners at Home',
    description: 'Prepare homemade meals together instead of ordering takeout.',
    pointsRestored: 30,
  },
  {
    title: 'Home Barista Mornings (3 Days)',
    description: 'Brew coffee at home for 3 consecutive mornings.',
    pointsRestored: 20,
  },
  {
    title: '24-Hour Non-Essential No-Spend Day',
    description: 'Commit to zero discretionary spending for one full day.',
    pointsRestored: 35,
  },
  {
    title: '10-Minute Financial Check-in & Chat',
    description: 'Sit down together with warm tea to review weekly essentials.',
    pointsRestored: 25,
  },
  {
    title: 'Pantry & Fridge Raid Challenge',
    description: 'Create a creative meal using only ingredients already in the pantry.',
    pointsRestored: 20,
  },
  {
    title: 'Free Outdoor Date',
    description: 'Enjoy a walk, hike, park picnic, or museum free day together.',
    pointsRestored: 25,
  },
];

export function generateNegativeSponge(
  weekNumber: number,
  monthKey: string,
  overspentAmount: number,
  categoryName: string = 'Budget'
): NegativeSponge {
  const spongeId = `sponge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const penalty = Math.min(200, Math.max(50, Math.round(overspentAmount * 0.5)));

  // Pick 2-3 random redemption tasks
  const shuffled = [...REDEMPTION_TASK_TEMPLATES].sort(() => 0.5 - Math.random());
  const selectedTasks: RedemptionTask[] = shuffled.slice(0, 3).map((t, idx) => ({
    id: `${spongeId}_task_${idx + 1}`,
    title: t.title,
    description: t.description,
    pointsRestored: t.pointsRestored,
    completed: false,
  }));

  return {
    id: spongeId,
    title: `Week ${weekNumber} Overage Task Set`,
    reason: `Overspent ${categoryName} by $${overspentAmount.toFixed(2)} in Week ${weekNumber}`,
    weekNumber,
    monthKey,
    overspentAmount,
    penaltyPoints: penalty,
    status: 'active',
    createdAt: Date.now(),
    tasks: selectedTasks,
  };
}

export interface WeekGamificationResult {
  basePoints: number;
  streakBonusPoints: number;
  streakBonusPercent: number;
  totalPointsEarned: number;
  totalWeekScore: number;
  newStreak: number;
  netDiff: number;
  negativeSponge?: NegativeSponge;
}

export function evaluateWeekGamification(
  weekDiff: number,
  currentStreak: number = 0,
  weekNumber: number = 1,
  monthKey: string = '',
  totalWeeklyBudget: number = 0,
  totalSpentThisWeek: number = 0
): WeekGamificationResult {
  const isUnderBudget = weekDiff >= 0;
  let basePoints = 0;
  let newStreak = 0;
  let streakBonusPercent = 0;
  let streakBonusPoints = 0;
  let negativeSponge: NegativeSponge | undefined;

  if (isUnderBudget) {
    basePoints = 500;
    if (weekDiff > 50) {
      basePoints += Math.min(300, Math.round(weekDiff * 2));
    }
    newStreak = currentStreak + 1;
    if (newStreak >= 2) {
      streakBonusPercent = (newStreak - 1) * 5;
      streakBonusPoints = Math.round(basePoints * (streakBonusPercent / 100));
    }
  } else {
    basePoints = 0;
    newStreak = 0;
    const overspent = Math.abs(weekDiff);
    negativeSponge = generateNegativeSponge(weekNumber, monthKey, overspent, 'Weekly Budget');
  }

  const totalPointsEarned = basePoints + streakBonusPoints;
  const totalWeekScore = isUnderBudget ? totalPointsEarned : -(negativeSponge?.penaltyPoints || 50);

  return {
    basePoints,
    streakBonusPoints,
    streakBonusPercent,
    totalPointsEarned,
    totalWeekScore,
    newStreak,
    netDiff: weekDiff,
    negativeSponge,
  };
}
