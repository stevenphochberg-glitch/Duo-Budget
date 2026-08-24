import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Receipt,
  Trash2,
  Sparkles,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  Search,
  Plus,
  ArrowRight,
  Check,
  Heart,
  ThumbsUp,
  Star,
  Coffee,
  Leaf,
  Shield,
  Flame,
  Coins,
} from 'lucide-react';
import { ChatMessage, Household, Partner, Transaction } from '../types';
import { apiClient } from '../api/client';
import { Avatar } from './Avatar';
import { CURATED_GIFS, GifItem } from '../data/gifList';

interface CoupleChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  activePartner: Partner;
  allTransactions: Transaction[];
  initialAttachedTransaction?: Transaction | null;
  onClearInitialAttachedTransaction?: () => void;
  onSelectTransactionToView?: (transaction: Transaction) => void;
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

const GIF_CATEGORIES = ['All', 'Money & Budget', 'Love & Cute', 'Food & Treats', 'Celebration', 'Funny & Reactions'];

export const CoupleChatDrawer: React.FC<CoupleChatDrawerProps> = ({
  isOpen,
  onClose,
  household,
  activePartner,
  allTransactions,
  initialAttachedTransaction,
  onClearInitialAttachedTransaction,
  onSelectTransactionToView,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachedTx, setAttachedTx] = useState<Transaction | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showTxPicker, setShowTxPicker] = useState(false);
  const [gifCategory, setGifCategory] = useState('All');
  const [gifSearch, setGifSearch] = useState('');
  const [customGifUrl, setCustomGifUrl] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [activeMessageReactionId, setActiveMessageReactionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial attached transaction when opened from external button
  useEffect(() => {
    if (initialAttachedTransaction) {
      setAttachedTx(initialAttachedTransaction);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialAttachedTransaction]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!household.id) return;

    apiClient.fetchMessages(household.id).then((initialMsgs) => {
      setMessages(initialMsgs);
    });

    const unsubscribe = apiClient.subscribeToMessages(household.id, (updatedMsgs) => {
      setMessages(updatedMsgs);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [household.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedTx) return;

    const contentToSend = inputText.trim();
    const txToSend = attachedTx;

    setInputText('');
    setAttachedTx(null);
    if (onClearInitialAttachedTransaction) onClearInitialAttachedTransaction();
    setShowGifPicker(false);
    setShowTxPicker(false);

    try {
      await apiClient.sendMessage({
        householdId: household.id,
        partnerId: activePartner.id,
        partnerName: activePartner.name,
        partnerAvatar: activePartner.avatarEmoji,
        content: contentToSend,
        attachedTransaction: txToSend || undefined,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSendGif = async (gif: GifItem) => {
    setShowGifPicker(false);
    try {
      await apiClient.sendMessage({
        householdId: household.id,
        partnerId: activePartner.id,
        partnerName: activePartner.name,
        partnerAvatar: activePartner.avatarEmoji,
        content: inputText.trim() || undefined,
        gifUrl: gif.url,
        gifTitle: gif.title,
      });
      setInputText('');
    } catch (err) {
      console.error('Failed to send GIF:', err);
    }
  };

  const handleToggleMessageReaction = async (messageId: string, reactionKey: string) => {
    try {
      await apiClient.toggleMessageReaction(messageId, activePartner.id, reactionKey);
      setActiveMessageReactionId(null);
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await apiClient.deleteMessage(messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  if (!isOpen) return null;

  const filteredGifs = CURATED_GIFS.filter((g) => {
    if (gifCategory !== 'All' && g.category !== gifCategory) return false;
    if (gifSearch.trim()) {
      return g.title.toLowerCase().includes(gifSearch.toLowerCase());
    }
    return true;
  });

  const filteredTransactions = allTransactions.filter((tx) => {
    if (!txSearch.trim()) return true;
    const q = txSearch.toLowerCase();
    return (
      (tx.note || '').toLowerCase().includes(q) ||
      (tx.subcategoryName || '').toLowerCase().includes(q) ||
      String(tx.amount).includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0A0E0A] flex justify-end">
      <div className="w-full sm:w-[480px] md:w-[520px] bg-[#141C14] border-l border-[#2B3B2B] text-[#E8EFE6] flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#263526] flex items-center justify-between bg-[#101710]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E2A1E] border border-[#344834] flex items-center justify-center text-[#8EA38A]">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#F4F8F3] tracking-wide">
                Couple Spending Chat
              </h3>
              <p className="text-xs text-[#8EA38A]">
                Synced conversation for {household.settings.partner1.name} & {household.settings.partner2.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8EA38A] hover:text-[#F4F8F3] hover:bg-[#1D271D] transition"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#121912]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1A251A] border border-[#2F402F] text-[#8EA38A] flex items-center justify-center shadow-inner">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#F4F8F3]">No Messages Yet</h4>
                <p className="text-xs text-[#8EA38A] max-w-xs">
                  Share expense receipts, discuss upcoming goals, or send GIFs to celebrate staying under budget!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.partnerId === activePartner.id;
              const reactionsMap = msg.reactions || {};

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[88%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <Avatar avatar={msg.partnerAvatar} name={msg.partnerName} size="sm" />

                  <div className="space-y-1 min-w-0">
                    <div className={`flex items-center gap-1.5 text-[10px] text-[#8EA38A] ${isMe ? 'justify-end' : ''}`}>
                      <span className="font-bold text-[#D4E0D2]">{msg.partnerName}</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-2xl text-xs space-y-2 border shadow-sm ${
                        isMe
                          ? 'bg-[#293B29] border-[#445E44] text-[#F4F8F3] rounded-tr-none'
                          : 'bg-[#1A251A] border-[#2E3F2E] text-[#E8EFE6] rounded-tl-none'
                      }`}
                    >
                      {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                      {/* Attached Transaction Card */}
                      {msg.attachedTransaction && (
                        <div
                          onClick={() => onSelectTransactionToView && onSelectTransactionToView(msg.attachedTransaction!)}
                          className="p-2.5 rounded-xl bg-[#111711] border border-[#283828] text-xs space-y-1 hover:border-[#4E684C] cursor-pointer transition"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[#F4F8F3] truncate">
                              {msg.attachedTransaction.subcategoryName || 'Expense'}
                            </span>
                            <span className="font-extrabold text-[#84BA80]">
                              ${msg.attachedTransaction.amount.toFixed(2)}
                            </span>
                          </div>
                          {msg.attachedTransaction.note && (
                            <p className="text-[11px] text-[#8EA38A] truncate">{msg.attachedTransaction.note}</p>
                          )}
                        </div>
                      )}

                      {/* Attached GIF */}
                      {msg.gifUrl && (
                        <div className="rounded-xl overflow-hidden border border-[#2E3F2E]">
                          <img
                            src={msg.gifUrl}
                            alt={msg.gifTitle || 'Shared GIF'}
                            className="w-full h-auto max-h-48 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Reactions Pill & Action */}
                    <div className={`flex items-center gap-1.5 flex-wrap ${isMe ? 'justify-end' : ''}`}>
                      {Object.entries(reactionsMap).map(([pId, rKeys]) =>
                        (rKeys as string[]).map((rKey, idx) => {
                          const matched = VECTOR_REACTIONS.find((v) => v.id === rKey);
                          return (
                            <button
                              key={`${pId}-${rKey}-${idx}`}
                              type="button"
                              onClick={() => handleToggleMessageReaction(msg.id, rKey)}
                              className="px-2 py-0.5 rounded-full bg-[#182218] border border-[#2B3B2B] text-[10px] flex items-center gap-1"
                            >
                              {matched ? matched.icon : <Heart className="w-3 h-3 text-[#8EA38A]" />}
                              <span className="text-[#8EA38A]">{matched?.label || rKey}</span>
                            </button>
                          );
                        })
                      )}

                      {/* Add Reaction Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMessageReactionId(activeMessageReactionId === msg.id ? null : msg.id)
                        }
                        className="text-[10px] font-bold text-[#8EA38A] hover:text-[#D4E0D2] px-1.5 py-0.5 rounded-md hover:bg-[#1A251A]"
                      >
                        + React
                      </button>

                      {isMe && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-[10px] text-[#8EA38A] hover:text-[#E58080] px-1"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Reaction Picker Popup */}
                    {activeMessageReactionId === msg.id && (
                      <div className="p-2 rounded-xl bg-[#101710] border border-[#2A3B2A] flex items-center gap-1.5 animate-in fade-in duration-100 shadow-md">
                        {VECTOR_REACTIONS.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleToggleMessageReaction(msg.id, v.id)}
                            className="p-1.5 rounded-lg bg-[#182218] hover:bg-[#253525] border border-[#2E402E] transition"
                            title={v.label}
                          >
                            {v.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attached Transaction Preview Bar */}
        {attachedTx && (
          <div className="p-3 bg-[#111711] border-t border-[#253525] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Receipt className="w-4 h-4 text-[#8EA38A] shrink-0" />
              <div className="truncate">
                <span className="font-bold text-[#F4F8F3]">{attachedTx.subcategoryName || 'Expense'}</span>
                <span className="text-[#84BA80] font-bold ml-1.5">${attachedTx.amount.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setAttachedTx(null);
                if (onClearInitialAttachedTransaction) onClearInitialAttachedTransaction();
              }}
              className="p-1 rounded-md text-[#8EA38A] hover:text-[#F4F8F3]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* GIF Picker Overlay */}
        {showGifPicker && (
          <div className="p-3 bg-[#111811] border-t border-[#273727] max-h-60 overflow-y-auto space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#8EA38A]">
              <span>Couple GIFs</span>
              <button onClick={() => setShowGifPicker(false)} className="hover:text-[#F4F8F3]">
                Close
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {GIF_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGifCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                    gifCategory === cat
                      ? 'bg-[#314531] text-[#F4F8F3]'
                      : 'bg-[#182218] text-[#8EA38A] hover:text-[#D4E0D2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {filteredGifs.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSendGif(g)}
                  className="rounded-lg overflow-hidden border border-[#273727] hover:border-[#4E684C] transition relative group"
                >
                  <img
                    src={g.url}
                    alt={g.title}
                    className="w-full h-16 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="w-full bg-[#1A241A] text-center text-[10px] text-[#A8CBA6] font-bold py-1 group-hover:bg-[#2F442F] group-hover:text-[#F4F8F3] transition">
                    Send GIF
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input Area */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#263526] bg-[#101710] space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGifPicker(!showGifPicker)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                showGifPicker
                  ? 'bg-[#293B29] border-[#4E684C] text-[#F4F8F3]'
                  : 'bg-[#162016] border-[#283928] text-[#8EA38A] hover:text-[#F4F8F3]'
              }`}
              title="Add GIF"
            >
              <ImageIcon className="w-4 h-4" />
              <span>GIF</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTxPicker(!showTxPicker)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                showTxPicker
                  ? 'bg-[#293B29] border-[#4E684C] text-[#F4F8F3]'
                  : 'bg-[#162016] border-[#283928] text-[#8EA38A] hover:text-[#F4F8F3]'
              }`}
              title="Attach Expense"
            >
              <Receipt className="w-4 h-4" />
              <span>Attach</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              placeholder="Message your partner..."
              className="w-full bg-[#182318] border border-[#2D3E2D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F8F3] outline-none focus:border-[#8EA38A] resize-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !attachedTx}
              className="p-2.5 rounded-xl bg-[#4E684C] hover:bg-[#5D7B5B] disabled:bg-[#253425] disabled:text-[#688166] text-[#F4F8F3] transition shrink-0 shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
