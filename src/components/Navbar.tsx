import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  Award,
  Settings,
  LogOut,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  MessageCircle,
  Shield,
  Coins,
  Leaf,
  Sprout,
  Sun,
  Trees,
  Mountain,
  Compass,
} from 'lucide-react';
import { Household, MonthPeriodData, Partner } from '../types';
import { Avatar } from './Avatar';
import { calculateLevel } from '../utils/gamification';

interface NavbarProps {
  household: Household;
  activePartner: Partner;
  onSwitchPartner: (partnerId: string) => void;
  monthData: MonthPeriodData;
  selectedWeekNumber: number;
  onSelectWeek: (weekNum: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenQuickExpense: () => void;
  onOpenGamification: () => void;
  onOpenSettings: () => void;
  onOpenMonthOverview: () => void;
  onOpenTutorial?: () => void;
  onOpenChat: () => void;
  chatMessageCount?: number;
  onLogout: () => void;
  weeklyBudget?: number;
  weekDiff?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  household,
  activePartner,
  onSwitchPartner,
  monthData,
  selectedWeekNumber,
  onSelectWeek,
  onPrevMonth,
  onNextMonth,
  onOpenQuickExpense,
  onOpenGamification,
  onOpenSettings,
  onOpenMonthOverview,
  onOpenTutorial,
  onOpenChat,
  chatMessageCount,
  onLogout,
  weeklyBudget = 0,
  weekDiff = 0,
}) => {
  const { settings, score } = household;
  const currentWeek = monthData.weeks.find((w) => w.weekNumber === selectedWeekNumber) || monthData.weeks[0];

  const totalPoints = score?.totalPoints || 0;
  const levelInfo = calculateLevel(totalPoints);
  const currentStreak = score?.currentStreakWeeks || 0;

  // Level vector icon helper
  const renderLevelIcon = () => {
    switch (levelInfo.badge) {
      case 'Sprout':
        return <Sprout className="w-4 h-4 text-[#84BA80]" />;
      case 'Leaf':
        return <Leaf className="w-4 h-4 text-[#84BA80]" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-[#D4A373]" />;
      case 'Trees':
        return <Trees className="w-4 h-4 text-[#60935D]" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-[#D4A373]" />;
      case 'Mountain':
        return <Mountain className="w-4 h-4 text-[#7FA1B3]" />;
      default:
        return <Leaf className="w-4 h-4 text-[#84BA80]" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#141D14] border-b border-[#2C3B2C] text-[#E8EFE6] shadow-md">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Household Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#223022] border border-[#3C523C] flex items-center justify-center text-[#8EA38A] shadow-inner shrink-0">
              <Leaf className="w-5 h-5 text-[#A8C5A4]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif font-bold text-[#F4F8F3] text-sm sm:text-base truncate tracking-wide">
                  {household.name}
                </span>
                <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-md bg-[#1C271C] text-[#A8BEA4] border border-[#304030] font-mono">
                  {settings.calendarMode === 'fiscal' ? 'Fiscal Month' : 'Calendar Month'}
                </span>
              </div>
              <p className="text-[11px] text-[#8EA38A] hidden sm:block">
                Sync Code: <span className="font-mono text-[#D4E0D2] font-bold tracking-wider">{household.inviteCode}</span>
              </p>
            </div>
          </div>

          {/* Center Month Navigator */}
          <div className="flex items-center gap-1 bg-[#0E140E] border border-[#243224] rounded-xl p-1 shadow-inner">
            <button
              onClick={onPrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg text-[#8EA38A] hover:text-[#F4F8F3] hover:bg-[#1D271D] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs sm:text-sm font-serif font-bold text-[#F4F8F3] px-2 sm:px-3 tracking-wide flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#5B8296] hidden sm:inline" />
              {monthData.monthTitle}
            </span>

            <button
              onClick={onNextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg text-[#8EA38A] hover:text-[#F4F8F3] hover:bg-[#1D271D] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Area: Partner Switcher & Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Gamification Level & XP Pill */}
            <button
              onClick={onOpenGamification}
              className="flex items-center gap-1.5 bg-[#1B251B] hover:bg-[#253225] border border-[#344634] px-2.5 py-1.5 rounded-xl transition text-left shadow-sm"
              title="Gamification & Couple Score"
            >
              {renderLevelIcon()}
              <div className="text-xs font-extrabold text-[#D4A373] hidden sm:inline">
                Lv.{levelInfo.level} · {totalPoints.toLocaleString()} pts
              </div>
            </button>

            {/* Chat Trigger */}
            <button
              onClick={onOpenChat}
              className="relative p-2 rounded-xl bg-[#1B251B] hover:bg-[#253225] border border-[#344634] text-[#A8BEA4] hover:text-[#F4F8F3] transition"
              title="Open Couple Chat"
            >
              <MessageCircle className="w-4 h-4" />
              {chatMessageCount && chatMessageCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#A26A42] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {chatMessageCount > 9 ? '9+' : chatMessageCount}
                </span>
              ) : null}
            </button>

            {/* Partner Persona Switcher */}
            <div className="flex items-center bg-[#0E140E] border border-[#243224] rounded-xl p-1">
              <button
                onClick={() => onSwitchPartner('partner1')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition ${
                  activePartner.id === 'partner1'
                    ? 'bg-[#263526] text-[#F4F8F3] shadow-sm border border-[#3E553E]'
                    : 'text-[#8EA38A] hover:text-[#D4E0D2]'
                }`}
                title={`Switch to ${settings.partner1.name}`}
              >
                <Avatar avatar={settings.partner1.avatarEmoji} color={settings.partner1.color || '#5B8296'} size="xs" />
                <span className="hidden lg:inline">{settings.partner1.name}</span>
              </button>

              <button
                onClick={() => onSwitchPartner('partner2')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition ${
                  activePartner.id === 'partner2'
                    ? 'bg-[#263526] text-[#F4F8F3] shadow-sm border border-[#3E553E]'
                    : 'text-[#8EA38A] hover:text-[#D4E0D2]'
                }`}
                title={`Switch to ${settings.partner2.name}`}
              >
                <Avatar avatar={settings.partner2.avatarEmoji} color={settings.partner2.color || '#A26A42'} size="xs" />
                <span className="hidden lg:inline">{settings.partner2.name}</span>
              </button>
            </div>

            {/* Quick Log Action */}
            <button
              onClick={onOpenQuickExpense}
              className="bg-[#4E684C] hover:bg-[#5D7B5B] text-[#F4F8F3] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition"
              title="Log New Expense"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log</span>
            </button>

            {/* Settings & Month Overview */}
            {onOpenTutorial && (
              <button
                id="navbar-open-tutorial-btn"
                onClick={onOpenTutorial}
                className="p-2 rounded-xl bg-[#1B251B] hover:bg-[#253225] border border-[#344634] text-[#A8C5A4] hover:text-[#F4F8F3] transition flex items-center gap-1.5 text-xs font-bold"
                title="Settings & Setup Guide Walkthrough"
              >
                <Compass className="w-4 h-4 text-[#84BA80]" />
                <span className="hidden xl:inline">Guide</span>
              </button>
            )}

            <button
              onClick={onOpenMonthOverview}
              className="p-2 rounded-xl bg-[#1B251B] hover:bg-[#253225] border border-[#344634] text-[#8EA38A] hover:text-[#F4F8F3] transition hidden sm:flex"
              title="Month Summary & Rollovers"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-[#1B251B] hover:bg-[#253225] border border-[#344634] text-[#8EA38A] hover:text-[#F4F8F3] transition"
              title="Budget & Subcategory Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-[#1B251B] hover:bg-[#2A1D1D] border border-[#344634] hover:border-[#522F2F] text-[#8EA38A] hover:text-[#E58080] transition hidden md:flex"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Sub-Bar: Week Selection Strip (Solid & Tablet Friendly) */}
        <div className="py-2.5 border-t border-[#263326] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#8EA38A] uppercase tracking-wider hidden sm:inline mr-1">
              Select Week:
            </span>
            {monthData.weeks.map((w) => {
              const isSelected = w.weekNumber === selectedWeekNumber;

              return (
                <button
                  key={w.weekNumber}
                  onClick={() => onSelectWeek(w.weekNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#334633] text-[#F4F8F3] shadow-sm border border-[#4C684C]'
                      : 'bg-[#182118] text-[#8EA38A] hover:text-[#D4E0D2] border border-[#273427] hover:bg-[#202B20]'
                  }`}
                >
                  <span>W{w.weekNumber}</span>
                  <span className="text-[10px] text-[#A5BBA2] hidden md:inline">({w.label.split('(')[1]?.replace(')', '') || ''})</span>
                  {w.isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84BA80]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current selected week status summary */}
          <div className="text-right flex items-center gap-3 shrink-0">
            <div className="text-[11px] text-[#8EA38A] hidden sm:block">
              Week {currentWeek?.weekNumber ?? selectedWeekNumber} Budget: <strong className="text-[#F4F8F3] font-bold">{settings.currencySymbol || '$'}{(weeklyBudget ?? 0).toLocaleString()}</strong>
            </div>
            <div className="text-xs font-extrabold flex items-center gap-1">
              <span className="text-[#8EA38A] text-[10px] uppercase font-mono">Net:</span>
              <span
                className={
                  (weekDiff ?? 0) >= 0
                    ? 'text-[#84BA80]'
                    : 'text-[#E58080]'
                }
              >
                {(weekDiff ?? 0) >= 0 ? '+' : ''}
                {settings.currencySymbol || '$'}
                {(weekDiff ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
