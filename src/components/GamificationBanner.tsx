import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
  Zap,
  Gift,
  Sprout,
  Leaf,
  Trees,
  Sun,
  Mountain,
  Shield,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Household, MonthPeriodData, Partner, NegativeSponge, GamificationBadge } from '../types';
import { ALL_BADGES, calculateLevel } from '../utils/gamification';

interface GamificationBannerProps {
  household: Household;
  activePartner: Partner;
  monthData: MonthPeriodData;
  selectedWeekNumber: number;
  currentWeekDiff: number;
  currency: string;
  onOpenGamificationModal: () => void;
  onToggleTask: (spongeId: string, taskId: string) => Promise<void>;
}

export const GamificationBanner: React.FC<GamificationBannerProps> = ({
  household,
  activePartner,
  monthData,
  selectedWeekNumber,
  currentWeekDiff,
  currency,
  onOpenGamificationModal,
  onToggleTask,
}) => {
  const { score, gambles = [], sponges = [], unlockedBadgeIds = [] } = household;
  const totalPoints = score?.totalPoints || 0;
  const currentStreak = score?.currentStreakWeeks || 0;
  const levelInfo = calculateLevel(totalPoints);

  const activeSponges = sponges.filter((s) => s.status === 'active');
  const earnedBadges = ALL_BADGES.filter((b) => unlockedBadgeIds.includes(b.id));

  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const handleTaskClick = async (spongeId: string, taskId: string) => {
    setTogglingTaskId(taskId);
    try {
      await onToggleTask(spongeId, taskId);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const renderLevelIcon = (badgeName: string) => {
    switch (badgeName) {
      case 'Sprout':
        return <Sprout className="w-6 h-6 text-[#84BA80]" />;
      case 'Leaf':
        return <Leaf className="w-6 h-6 text-[#84BA80]" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-[#D4A373]" />;
      case 'Trees':
        return <Trees className="w-6 h-6 text-[#60935D]" />;
      case 'Sun':
        return <Sun className="w-6 h-6 text-[#D4A373]" />;
      case 'Mountain':
        return <Mountain className="w-6 h-6 text-[#7FA1B3]" />;
      default:
        return <Sprout className="w-6 h-6 text-[#84BA80]" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* SOLID GAMIFICATION HERO BAR (SAGE, BEIGE & FOREST GREEN PALETTE) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#1B241B] border border-[#324332] shadow-sm text-[#E8EFE6]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Level, Title & XP Progress */}
          <div className="flex items-start sm:items-center gap-3.5 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#243324] border border-[#3C533C] flex items-center justify-center shadow-inner shrink-0">
              {renderLevelIcon(levelInfo.badge)}
            </div>

            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#2C3E2C] text-[#B5D0B2] border border-[#445E44]">
                  Level {levelInfo.level} Couple
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#F4F8F3] tracking-wide">
                  {levelInfo.title}
                </h2>
                <span className="text-xs font-bold text-[#D4A373] bg-[#292019] px-2.5 py-0.5 rounded-full border border-[#4A3729]">
                  {totalPoints.toLocaleString()} Points
                </span>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1 max-w-md">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#9BB197]">
                  <span>
                    {levelInfo.nextLevelTitle ? `Progress to ${levelInfo.nextLevelTitle}` : 'Max Mastery'}
                  </span>
                  <span>
                    {levelInfo.pointsToNext > 0 ? `${levelInfo.pointsToNext} pts to Level ${levelInfo.level + 1}` : 'Top Rank'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#121812] overflow-hidden border border-[#273527]">
                  <div
                    className="h-full bg-[#4E684C] transition-all duration-500 rounded-full"
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center & Right: Streak, Gambles & Badges Quick Stats */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap lg:flex-nowrap justify-between lg:justify-end border-t lg:border-t-0 border-[#283628] pt-3 lg:pt-0">
            {/* Streak Pill */}
            <div className="px-3.5 py-2 rounded-xl bg-[#141C14] border border-[#273627] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#D4A373]" />
              <div>
                <div className="text-[10px] font-bold text-[#8EA38A] uppercase">Discipline Streak</div>
                <div className="text-xs font-extrabold text-[#F4F8F3]">
                  {currentStreak} {currentStreak === 1 ? 'Week' : 'Weeks'}
                  {currentStreak >= 2 && <span className="text-[#84BA80] text-[10px] ml-1">(+{(currentStreak - 1) * 5}% bonus)</span>}
                </div>
              </div>
            </div>

            {/* Badges Count */}
            <div className="px-3.5 py-2 rounded-xl bg-[#141C14] border border-[#273627] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#7FA1B3]" />
              <div>
                <div className="text-[10px] font-bold text-[#8EA38A] uppercase">Badges Earned</div>
                <div className="text-xs font-extrabold text-[#F4F8F3]">
                  {earnedBadges.length} / {ALL_BADGES.length} Unlocked
                </div>
              </div>
            </div>

            {/* Open Full Gamification Center Button */}
            <button
              onClick={onOpenGamificationModal}
              className="px-4 py-2.5 rounded-xl bg-[#364936] hover:bg-[#465E46] text-xs font-bold text-[#F4F8F3] flex items-center gap-1.5 transition shadow-sm"
            >
              <span>Gamification Center</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#B5D0B2]" />
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE OVERSPENDING SPONGES & REDEMPTION TASKS BAR (SOLID BROWN / RED ACCENTS) */}
      {activeSponges.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#231C18] border border-[#48372D] text-[#F3ECE6] space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3B2C23] pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#38281E] text-[#D4A373] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-[#D4A373]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#F3ECE6] flex items-center gap-2">
                  <span>Active Overspending Task Sets ({activeSponges.length})</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#382218] text-[#E58080] border border-[#523023]">
                    Tasks Required to Expunge
                  </span>
                </h4>
                <p className="text-xs text-[#C5B3A3]">
                  Complete partner tasks together to restore points and clear overage penalties.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenGamificationModal}
              className="text-xs font-bold text-[#D4A373] hover:text-[#E8C29C] flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Challenges</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSponges.map((sponge) => {
              const completedCount = sponge.tasks.filter((t) => t.completed).length;
              const allDone = completedCount === sponge.tasks.length;

              return (
                <div
                  key={sponge.id}
                  className="p-3.5 rounded-xl bg-[#191411] border border-[#352820] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#F3ECE6]">{sponge.title}</div>
                      <div className="text-[11px] text-[#A69383]">{sponge.reason}</div>
                    </div>
                    <span className="text-[10px] font-bold text-[#E58080] bg-[#2E1B1B] px-2 py-0.5 rounded-md border border-[#482828] whitespace-nowrap">
                      -{sponge.penaltyPoints} pts
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-1.5 pt-1">
                    {sponge.tasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => handleTaskClick(sponge.id, task.id)}
                        disabled={togglingTaskId === task.id}
                        className={`w-full p-2 rounded-lg text-left text-xs transition flex items-center justify-between gap-2 border ${
                          task.completed
                            ? 'bg-[#1E291E] border-[#395039] text-[#84BA80]'
                            : 'bg-[#201915] border-[#392B22] text-[#D8C9BC] hover:border-[#523E32]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#84BA80] shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#8A7566] shrink-0" />
                          )}
                          <span className={`truncate font-medium ${task.completed ? 'line-through text-[#668564]' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#84BA80] shrink-0">
                          +{task.pointsRestored} pts
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
