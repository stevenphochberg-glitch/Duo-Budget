import React from 'react';
import {
  Users,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Flame,
  Award,
  RefreshCw,
  Calendar,
  DollarSign,
  Leaf,
  Shield,
  Coins,
  Sparkles,
} from 'lucide-react';
import { Partner } from '../types';

interface LandingPageProps {
  onDemoLogin: (partnerId: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenJoin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onDemoLogin,
  onOpenLogin,
  onOpenRegister,
  onOpenJoin,
}) => {
  return (
    <div className="min-h-screen bg-[#111711] text-[#E8EFE6] selection:bg-[#4E684C] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#243324] bg-[#141D14] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#223022] border border-[#3C523C] flex items-center justify-center shadow-inner text-[#8EA38A]">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-serif font-bold tracking-wide text-[#F4F8F3] flex items-center gap-2">
                DuoBudget <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F2B1F] text-[#A8BEA4] border border-[#304230] font-sans">Couples</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onOpenJoin}
              className="text-xs font-bold text-[#8EA38A] hover:text-[#F4F8F3] px-3 py-1.5 rounded-xl border border-[#2B3C2B] hover:border-[#3D553D] transition"
            >
              Join Partner Code
            </button>
            <button
              onClick={onOpenLogin}
              className="text-xs font-bold text-[#8EA38A] hover:text-[#F4F8F3] px-3 py-1.5 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onDemoLogin('partner1')}
              className="text-xs font-bold bg-[#4E684C] hover:bg-[#5D7B5B] text-[#F4F8F3] px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span>Instant Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A251A] border border-[#2F402F] text-xs font-bold text-[#D4A373] mb-6">
              <Leaf className="w-3.5 h-3.5 text-[#8EA38A]" />
              <span>Multi-Tier Couple Budgeting & Dynamic Weekly Rollover</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-wide text-[#F4F8F3] leading-tight">
              Budget together in harmony. <br />
              <span className="text-[#8EA38A]">
                Earthy, solid, and disciplined.
              </span>
            </h1>
            <p className="mt-6 text-sm sm:text-base text-[#B0C4AE] max-w-2xl mx-auto leading-relaxed">
              Track monthly income, Required living costs, Discretionary fun money, and Reserve sinking funds. Weekly budgets auto-adjust dynamically as you spend, with gamified couple ranks, accountability sponge tasks, and zero emojis.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onDemoLogin('partner1')}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#4E684C] hover:bg-[#5D7B5B] text-[#F4F8F3] shadow-md transition flex items-center gap-2"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenRegister}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#1A241A] hover:bg-[#233123] text-[#E8EFE6] border border-[#2D3F2D] transition"
              >
                Create Couple Account
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#8EA38A] flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#84BA80]" /> Real-time Cloud Sync</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#84BA80]" /> Tablet & Mobile Optimized</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#84BA80]" /> Vector Crest Emblems</span>
            </div>
          </div>

          {/* Feature Pillars Grid */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Three Tier Categorization */}
            <div className="bg-[#182318] border border-[#2C3D2C] p-6 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#223022] border border-[#384C38] flex items-center justify-center text-[#7FA1B3]">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#F4F8F3]">3 Dedicated Budget Tiers</h3>
              <p className="text-xs text-[#8EA38A] leading-relaxed">
                Parent budget ceilings guide child allocations with instant balance checking:
              </p>
              <ul className="space-y-2 text-xs text-[#D4E0D2]">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5B8296] mt-1 shrink-0" />
                  <div><strong className="text-[#F4F8F3]">Required:</strong> Rent, Bills, Utilities, Groceries, Transit, Subscriptions.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4A373] mt-1 shrink-0" />
                  <div><strong className="text-[#F4F8F3]">Discretionary:</strong> Guilt-free dining out and couple lifestyle.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4E684C] mt-1 shrink-0" />
                  <div><strong className="text-[#F4F8F3]">Reserved:</strong> Emergency fund, Vacation fund, and Investments.</div>
                </li>
              </ul>
            </div>

            {/* 2. Dynamic Weekly Rollover */}
            <div className="bg-[#182318] border border-[#2C3D2C] p-6 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#223022] border border-[#384C38] flex items-center justify-center text-[#D4A373]">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#F4F8F3]">Dynamic Weekly Rollover</h3>
              <p className="text-xs text-[#8EA38A] leading-relaxed">
                Weekly spending automatically recalibrates downstream weeks within the month to keep the couple on target without manual spreadsheet math.
              </p>
              <div className="p-3 rounded-xl bg-[#121912] border border-[#243324] text-xs text-[#A8BEA4] space-y-1 font-mono">
                <div>Week 1 Overspend: -$60</div>
                <div>Remaining 3 Weeks: Auto - $20/wk</div>
                <div className="text-[#84BA80]">Month End: Clean Baseline Reset</div>
              </div>
            </div>

            {/* 3. Gamification Ranks */}
            <div className="bg-[#182318] border border-[#2C3D2C] p-6 rounded-2xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#223022] border border-[#384C38] flex items-center justify-center text-[#84BA80]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#F4F8F3]">Gamification & Accountability</h3>
              <p className="text-xs text-[#8EA38A] leading-relaxed">
                Level up from Sprout to Mountain. Overspending creates negative sponge challenges that couples expunge together through frugal household tasks.
              </p>
              <div className="p-3 rounded-xl bg-[#121912] border border-[#243324] text-xs text-[#D4A373] space-y-1">
                <div>✓ Discipline Streak Multipliers (+5%/wk)</div>
                <div>✓ High-Roller Underspend Gambles</div>
                <div>✓ Cooperative Task Expungements</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
