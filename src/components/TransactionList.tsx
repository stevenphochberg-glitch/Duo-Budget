import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  Home,
  Landmark,
  Plus,
  ArrowUpDown,
  Tag,
  MessageSquare,
  Heart,
  ThumbsUp,
  Star,
  Coffee,
  Leaf,
  Shield,
  Flame,
  Coins,
} from 'lucide-react';
import {
  Household,
  MainCategoryKey,
  Partner,
  SubcategoryConfig,
  Transaction,
} from '../types';
import { Avatar } from './Avatar';

interface TransactionListProps {
  transactions: Transaction[];
  subcategories: SubcategoryConfig[];
  household: Household;
  activePartner: Partner;
  currency: string;
  selectedWeekNumber: number;
  onToggleReaction: (transactionId: string, emoji: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onAddExpenseClick: () => void;
  onShareToChat?: (transaction: Transaction) => void;
}

const VECTOR_REACTIONS = [
  { id: 'heart', label: 'Love', icon: <Heart className="w-3.5 h-3.5 text-[#E58080]" /> },
  { id: 'star', label: 'Star', icon: <Star className="w-3.5 h-3.5 text-[#D4A373]" /> },
  { id: 'thumbs_up', label: 'Great', icon: <ThumbsUp className="w-3.5 h-3.5 text-[#84BA80]" /> },
  { id: 'coffee', label: 'Coffee', icon: <Coffee className="w-3.5 h-3.5 text-[#D4A373]" /> },
  { id: 'sparkles', label: 'Sparkle', icon: <Sparkles className="w-3.5 h-3.5 text-[#7FA1B3]" /> },
  { id: 'leaf', label: 'Sage', icon: <Leaf className="w-3.5 h-3.5 text-[#84BA80]" /> },
  { id: 'shield', label: 'Safe', icon: <Shield className="w-3.5 h-3.5 text-[#7FA1B3]" /> },
  { id: 'flame', label: 'Fire', icon: <Flame className="w-3.5 h-3.5 text-[#D4A373]" /> },
];

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  subcategories,
  household,
  activePartner,
  currency,
  selectedWeekNumber,
  onToggleReaction,
  onEditTransaction,
  onDeleteTransaction,
  onAddExpenseClick,
  onShareToChat,
}) => {
  const [partnerFilter, setPartnerFilter] = useState<'all' | 'partner1' | 'partner2'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | MainCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openReactionPickerTxId, setOpenReactionPickerTxId] = useState<string | null>(null);

  const { settings } = household;

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (partnerFilter !== 'all' && tx.partnerId !== partnerFilter) return false;
    if (categoryFilter !== 'all' && tx.mainCategory !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNote = (tx.note || '').toLowerCase().includes(q);
      const matchSub = (tx.subcategoryName || '').toLowerCase().includes(q);
      const matchPartner = (tx.partnerName || '').toLowerCase().includes(q);
      if (!matchNote && !matchSub && !matchPartner) return false;
    }
    return true;
  });

  const categoryIcons: Record<MainCategoryKey, React.ReactNode> = {
    required: <Home className="w-3.5 h-3.5 text-[#7FA1B3]" />,
    discretionary: <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />,
    reserved: <Shield className="w-3.5 h-3.5 text-[#84BA80]" />,
  };

  const getReactionIcon = (reactionId: string) => {
    const found = VECTOR_REACTIONS.find((vr) => vr.id === reactionId);
    return found ? found.icon : <Heart className="w-3.5 h-3.5 text-[#8EA38A]" />;
  };

  return (
    <div className="bg-[#182318] border border-[#2D3E2D] rounded-2xl p-4 sm:p-5 shadow-sm text-[#E8EFE6] space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#263526]">
        <div>
          <h3 className="font-serif font-bold text-[#F4F8F3] text-base flex items-center gap-2">
            <span>Expenses & Partner Activity</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#223022] text-[#84BA80] border border-[#354835] font-mono">
              {filteredTransactions.length}
            </span>
          </h3>
          <p className="text-xs text-[#8EA38A]">
            Log, filter, and stamp partner vector reactions or share directly to chat.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Partner Filter */}
          <div className="flex items-center bg-[#121812] border border-[#243224] rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setPartnerFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                partnerFilter === 'all' ? 'bg-[#243324] text-[#F4F8F3]' : 'text-[#8EA38A] hover:text-[#D4E0D2]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPartnerFilter('partner1')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                partnerFilter === 'partner1'
                  ? 'bg-[#1F2E38] text-[#7FA1B3] border border-[#354D5D]'
                  : 'text-[#8EA38A] hover:text-[#D4E0D2]'
              }`}
            >
              <Avatar avatar={settings.partner1.avatarEmoji} color={settings.partner1.color || '#5B8296'} size="xs" />
              <span className="hidden md:inline">{settings.partner1.name}</span>
            </button>
            <button
              onClick={() => setPartnerFilter('partner2')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                partnerFilter === 'partner2'
                  ? 'bg-[#2E2319] text-[#D4A373] border border-[#4D3A29]'
                  : 'text-[#8EA38A] hover:text-[#D4E0D2]'
              }`}
            >
              <Avatar avatar={settings.partner2.avatarEmoji} color={settings.partner2.color || '#A26A42'} size="xs" />
              <span className="hidden md:inline">{settings.partner2.name}</span>
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-[#121812] border border-[#243224] text-xs text-[#D4E0D2] font-semibold rounded-xl px-2.5 py-1.5 outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="required">Required</option>
            <option value="discretionary">Discretionary (Fun)</option>
            <option value="reserved">Reserve & Savings</option>
          </select>

          {/* Add Log Button */}
          <button
            onClick={onAddExpenseClick}
            className="bg-[#4E684C] hover:bg-[#5D7B5B] text-[#F4F8F3] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8EA38A] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by note, category, or partner..."
            className="w-full bg-[#121812] border border-[#243224] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F8F3] outline-none focus:border-[#8EA38A]"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-[#141C14] rounded-2xl border border-[#243224] text-xs text-[#8EA38A] space-y-3">
            <p>No expenses logged yet.</p>
            <button
              id="empty-state-log-expense-btn"
              type="button"
              onClick={onAddExpenseClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4E684C] hover:bg-[#5D7B5B] text-[#F4F8F3] font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Expense</span>
            </button>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const partnerColor = tx.partnerId === 'partner1' ? settings.partner1.color || '#5B8296' : settings.partner2.color || '#A26A42';
            const partnerAvatar = tx.partnerId === 'partner1' ? settings.partner1.avatarEmoji : settings.partner2.avatarEmoji;
            const reactionsMap = tx.reactions || {};

            return (
              <div
                key={tx.id}
                className="p-3 sm:p-3.5 rounded-xl bg-[#141C14] hover:bg-[#1A251A] border border-[#263526] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Left: Category Icon, Subcategory & Notes */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#1D271D] border border-[#2D3E2D] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    {categoryIcons[tx.mainCategory]}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#F4F8F3] truncate text-xs sm:text-sm">
                        {tx.subcategoryName || 'Expense'}
                      </span>
                      <span className="text-[10px] text-[#8EA38A] font-mono">
                        {tx.date}
                      </span>
                    </div>

                    {tx.note && (
                      <p className="text-[11px] text-[#8EA38A] truncate max-w-md">{tx.note}</p>
                    )}

                    {/* Reactions Pill Display */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {Object.entries(reactionsMap).map(([pId, rKeys]) =>
                        (rKeys as string[]).map((rKey, idx) => (
                          <button
                            key={`${pId}-${rKey}-${idx}`}
                            type="button"
                            onClick={() => onToggleReaction(tx.id, rKey)}
                            className="px-2 py-0.5 rounded-full bg-[#1C261C] border border-[#2D3E2D] text-[10px] flex items-center gap-1"
                          >
                            {getReactionIcon(rKey)}
                            <span className="text-[#8EA38A]">{rKey}</span>
                          </button>
                        ))
                      )}

                      {/* Add Reaction Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenReactionPickerTxId(openReactionPickerTxId === tx.id ? null : tx.id)
                        }
                        className="text-[10px] font-bold text-[#8EA38A] hover:text-[#D4E0D2] px-1.5 py-0.5 rounded hover:bg-[#1D271D]"
                      >
                        + Stamp
                      </button>
                    </div>

                    {/* Reaction Popup Selector */}
                    {openReactionPickerTxId === tx.id && (
                      <div className="p-1.5 rounded-xl bg-[#101710] border border-[#273727] flex items-center gap-1.5 mt-1 animate-in fade-in duration-100 shadow-md">
                        {VECTOR_REACTIONS.map((vr) => (
                          <button
                            key={vr.id}
                            type="button"
                            onClick={() => {
                              onToggleReaction(tx.id, vr.id);
                              setOpenReactionPickerTxId(null);
                            }}
                            className="p-1.5 rounded-lg bg-[#182218] hover:bg-[#253525] border border-[#2E402E] transition"
                            title={vr.label}
                          >
                            {vr.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Partner Tag, Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#121812] px-2.5 py-1 rounded-lg border border-[#243224]">
                    <Avatar avatar={partnerAvatar} color={partnerColor} size="xs" />
                    <span className="text-[11px] font-bold text-[#D4E0D2]">{tx.partnerName}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-bold text-[#F4F8F3]">
                      {currency}{tx.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {onShareToChat && (
                      <button
                        type="button"
                        onClick={() => onShareToChat(tx)}
                        className="p-1.5 rounded-lg text-[#8EA38A] hover:text-[#F4F8F3] hover:bg-[#202C20] transition"
                        title="Share to Couple Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onEditTransaction(tx)}
                      className="p-1.5 rounded-lg text-[#8EA38A] hover:text-[#D4E0D2] hover:bg-[#202C20] transition"
                      title="Edit Expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-[#8EA38A] hover:text-[#E58080] hover:bg-[#2C1D1D] transition"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
