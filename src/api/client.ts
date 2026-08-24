import {
  db,
  createDefaultHousehold,
  createEmptyHousehold,
  createDefaultSampleTransactions,
  createDefaultSampleMessages,
} from '../services/firebaseService';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import {
  Household,
  HouseholdSettings,
  SubcategoryConfig,
  Transaction,
  UserAccount,
  WeekGamble,
  WeekScoreRecord,
  ChatMessage,
} from '../types';

export const apiClient = {
  // Demo Login
  async demoLogin(partnerId: string = 'partner1'): Promise<{ user: UserAccount; household: Household }> {
    const demoHouseholdId = 'household-demo';
    const householdRef = doc(db, 'households', demoHouseholdId);
    const householdSnap = await getDoc(householdRef);

    let household: Household;
    if (!householdSnap.exists()) {
      household = createDefaultHousehold(
        demoHouseholdId,
        'Alex & Jordan’s Home',
        'LOVE26'
      );
      await setDoc(householdRef, household);

      // Seed transactions
      const sampleTxs = createDefaultSampleTransactions(demoHouseholdId);
      const batch = writeBatch(db);
      for (const tx of sampleTxs) {
        batch.set(doc(db, 'transactions', tx.id), tx);
      }
      // Seed initial sample messages
      const sampleMsgs = createDefaultSampleMessages(demoHouseholdId);
      for (const msg of sampleMsgs) {
        batch.set(doc(db, 'messages', msg.id), msg);
      }
      await batch.commit();
    } else {
      household = householdSnap.data() as Household;
    }

    const demoUser: UserAccount = {
      id: `user-${partnerId}`,
      email: `${partnerId === 'partner1' ? 'alex' : 'jordan'}@couplesbudget.demo`,
      name: partnerId === 'partner1' ? household.settings.partner1.name : household.settings.partner2.name,
      partnerId,
      householdId: demoHouseholdId,
      passwordHash: 'demopass',
    };

    return { user: demoUser, household };
  },

  // Register New Household and Account
  async register(data: {
    email: string;
    password: string;
    householdName: string;
    partner1Name: string;
    partner1Emoji?: string;
    partner1Color?: string;
    partner2Name: string;
    partner2Emoji?: string;
    partner2Color?: string;
  }): Promise<{ user: UserAccount; household: Household }> {
    const email = data.email.toLowerCase().trim();
    
    // Check if user already exists
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const userDocs = await getDocs(usersQuery);
    if (!userDocs.empty) {
      throw new Error('An account with this email already exists.');
    }

    const householdId = 'hh-' + Math.random().toString(36).substring(2, 9);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const household = createEmptyHousehold(
      householdId,
      data.householdName || 'Our Household',
      inviteCode,
      {
        name: data.partner1Name || 'Partner 1',
        avatarEmoji: data.partner1Emoji || 'botanical_leaf',
        color: data.partner1Color || '#5B8296',
      },
      {
        name: data.partner2Name || 'Partner 2',
        avatarEmoji: data.partner2Emoji || 'hearth_flame',
        color: data.partner2Color || '#A26A42',
      }
    );

    // Save empty household to Firestore (NO sample data seeded)
    await setDoc(doc(db, 'households', householdId), household);

    const userId = 'usr-' + Math.random().toString(36).substring(2, 9);
    const user: UserAccount = {
      id: userId,
      email,
      name: data.partner1Name || 'Partner 1',
      partnerId: 'partner1',
      householdId,
      passwordHash: data.password,
    };

    // Save user to Firestore
    await setDoc(doc(db, 'users', userId), user);

    return { user, household };
  },

  // Login Existing Account
  async login(
    email: string,
    password: string,
    partnerId?: string
  ): Promise<{ user: UserAccount; household: Household }> {
    const cleanEmail = email.toLowerCase().trim();
    const usersQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const userDocs = await getDocs(usersQuery);

    if (userDocs.empty) {
      throw new Error('No account found with this email address.');
    }

    const userDoc = userDocs.docs[0];
    const user = userDoc.data() as UserAccount;

    if (user.passwordHash !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    // Fetch household
    const householdRef = doc(db, 'households', user.householdId);
    const householdSnap = await getDoc(householdRef);

    if (!householdSnap.exists()) {
      throw new Error('Household data not found.');
    }

    const household = householdSnap.data() as Household;

    // Switch active partner persona if specified
    if (partnerId && (partnerId === 'partner1' || partnerId === 'partner2')) {
      user.partnerId = partnerId;
      user.name = partnerId === 'partner1' ? household.settings.partner1.name : household.settings.partner2.name;
    }

    return { user, household };
  },

  // Join Existing Household via Invite Code
  async joinHousehold(data: {
    inviteCode: string;
    email: string;
    password: string;
    name: string;
    partnerRole: 'partner1' | 'partner2';
  }): Promise<{ user: UserAccount; household: Household }> {
    const inviteCode = data.inviteCode.trim().toUpperCase();
    const email = data.email.toLowerCase().trim();

    // Check if email already registered
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const userDocs = await getDocs(usersQuery);
    if (!userDocs.empty) {
      throw new Error('An account with this email already exists.');
    }

    // Find household by invite code
    const hhQuery = query(collection(db, 'households'), where('inviteCode', '==', inviteCode));
    const hhDocs = await getDocs(hhQuery);

    if (hhDocs.empty) {
      throw new Error('Invalid invite code. Please check with your partner.');
    }

    const householdDoc = hhDocs.docs[0];
    const household = householdDoc.data() as Household;

    // Update partner name in settings if provided
    if (data.name) {
      if (data.partnerRole === 'partner1') {
        household.settings.partner1.name = data.name;
      } else {
        household.settings.partner2.name = data.name;
      }
      await updateDoc(doc(db, 'households', household.id), {
        'settings.partner1.name': household.settings.partner1.name,
        'settings.partner2.name': household.settings.partner2.name,
      });
    }

    const userId = 'usr-' + Math.random().toString(36).substring(2, 9);
    const user: UserAccount = {
      id: userId,
      email,
      name: data.name || (data.partnerRole === 'partner1' ? household.settings.partner1.name : household.settings.partner2.name),
      partnerId: data.partnerRole,
      householdId: household.id,
      passwordHash: data.password,
    };

    await setDoc(doc(db, 'users', userId), user);

    return { user, household };
  },

  // Fetch Household and all its transactions from Firestore
  async fetchHousehold(householdId: string): Promise<{ household: Household; transactions: Transaction[] }> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);

    if (!householdSnap.exists()) {
      // If it's the demo household, initialize it
      if (householdId === 'household-demo') {
        const defaultHh = createDefaultHousehold('household-demo', 'Alex & Jordan’s Home', 'LOVE26');
        await setDoc(householdRef, defaultHh);
        const sampleTxs = createDefaultSampleTransactions('household-demo');
        const batch = writeBatch(db);
        for (const tx of sampleTxs) {
          batch.set(doc(db, 'transactions', tx.id), tx);
        }
        await batch.commit();
        return { household: defaultHh, transactions: sampleTxs };
      }
      throw new Error('Household not found');
    }

    const household = householdSnap.data() as Household;

    // Fetch transactions
    const txQuery = query(collection(db, 'transactions'), where('householdId', '==', householdId));
    const txDocs = await getDocs(txQuery);
    const transactions: Transaction[] = [];
    txDocs.forEach((d) => {
      transactions.push(d.data() as Transaction);
    });

    transactions.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt));

    return { household, transactions };
  },

  // Helper to sanitize subcategories so Firestore never encounters 'undefined' fields
  sanitizeSubcategories(subcategories: SubcategoryConfig[]): SubcategoryConfig[] {
    return subcategories.map((sub) => {
      const clean: SubcategoryConfig = {
        id: sub.id || 'sub_' + Math.random().toString(36).substring(2, 9),
        name: (sub.name || 'Custom Category').trim(),
        mainCategory: sub.mainCategory || 'required',
        spendingType: sub.spendingType || 'variable',
        targetMonthlyBudget: Number(sub.targetMonthlyBudget) || 0,
        iconName: sub.iconName || 'Tag',
        description: sub.description || '',
      };
      if (sub.fixedBaseAmount !== undefined && sub.fixedBaseAmount !== null) {
        clean.fixedBaseAmount = Number(sub.fixedBaseAmount) || 0;
      }
      return clean;
    });
  },

  // Update Settings
  async updateSettings(householdId: string, settings: Partial<HouseholdSettings>): Promise<{ household: Household }> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (!householdSnap.exists()) throw new Error('Household not found');

    const currentHh = householdSnap.data() as Household;
    const mergedSettings: HouseholdSettings = {
      ...currentHh.settings,
      ...settings,
      partner1: { ...currentHh.settings.partner1, ...(settings.partner1 || {}) },
      partner2: { ...currentHh.settings.partner2, ...(settings.partner2 || {}) },
    };

    await updateDoc(householdRef, { settings: mergedSettings });
    currentHh.settings = mergedSettings;
    return { household: currentHh };
  },

  // Update Subcategories with bulletproof sanitization
  async updateSubcategories(householdId: string, subcategories: SubcategoryConfig[]): Promise<{ household: Household }> {
    const householdRef = doc(db, 'households', householdId);
    const cleanSubcategories = this.sanitizeSubcategories(subcategories);

    await updateDoc(householdRef, { subcategories: cleanSubcategories });

    const householdSnap = await getDoc(householdRef);
    return { household: householdSnap.data() as Household };
  },

  // Atomic Update for Settings & Subcategories together
  async updateHouseholdConfig(
    householdId: string,
    data: { settings?: Partial<HouseholdSettings>; subcategories?: SubcategoryConfig[] }
  ): Promise<{ household: Household }> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (!householdSnap.exists()) throw new Error('Household not found');

    const currentHh = householdSnap.data() as Household;
    const updates: Record<string, any> = {};

    if (data.settings) {
      updates.settings = {
        ...currentHh.settings,
        ...data.settings,
        partner1: { ...currentHh.settings.partner1, ...(data.settings.partner1 || {}) },
        partner2: { ...currentHh.settings.partner2, ...(data.settings.partner2 || {}) },
      };
    }

    if (data.subcategories) {
      updates.subcategories = this.sanitizeSubcategories(data.subcategories);
    }

    await updateDoc(householdRef, updates);
    const updatedSnap = await getDoc(householdRef);
    return { household: updatedSnap.data() as Household };
  },

  // Add Transaction
  async addTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'reactions'>): Promise<{ transaction: Transaction }> {
    const newTxId = 'tx-' + Math.random().toString(36).substring(2, 9);
    const newTx: Transaction = {
      ...tx,
      id: newTxId,
      reactions: {},
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'transactions', newTxId), newTx);
    return { transaction: newTx };
  },

  // Update Transaction
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    const txRef = doc(db, 'transactions', id);
    const txSnap = await getDoc(txRef);
    if (!txSnap.exists()) throw new Error('Transaction not found');

    const updatedTx = { ...txSnap.data(), ...updates } as Transaction;
    await updateDoc(txRef, updates);
    return { transaction: updatedTx };
  },

  // Delete Transaction
  async deleteTransaction(id: string): Promise<boolean> {
    const txRef = doc(db, 'transactions', id);
    await deleteDoc(txRef);
    return true;
  },

  // Toggle Reaction on Transaction
  async toggleReaction(transactionId: string, partnerId: string, emoji: string): Promise<{ transaction: Transaction }> {
    const txRef = doc(db, 'transactions', transactionId);
    const txSnap = await getDoc(txRef);
    if (!txSnap.exists()) throw new Error('Transaction not found');

    const tx = txSnap.data() as Transaction;
    if (!tx.reactions) tx.reactions = {};
    if (!tx.reactions[partnerId]) tx.reactions[partnerId] = [];

    const existingIdx = tx.reactions[partnerId].indexOf(emoji);
    if (existingIdx >= 0) {
      tx.reactions[partnerId].splice(existingIdx, 1);
    } else {
      tx.reactions[partnerId].push(emoji);
    }

    await updateDoc(txRef, { reactions: tx.reactions });
    return { transaction: tx };
  },

  // Place Gamble
  async placeGamble(data: {
    householdId: string;
    partnerId: string;
    weekNumber: number;
    monthKey: string;
    overspentAmount: number;
    gambleAmount: number;
    notes?: string;
  }): Promise<{ gamble: WeekGamble; household: Household }> {
    const householdRef = doc(db, 'households', data.householdId);
    const householdSnap = await getDoc(householdRef);
    if (!householdSnap.exists()) throw new Error('Household not found');

    const household = householdSnap.data() as Household;
    const newGamble: WeekGamble = {
      id: 'g-' + Math.random().toString(36).substring(2, 9),
      householdId: data.householdId,
      partnerId: data.partnerId,
      weekNumber: data.weekNumber,
      monthKey: data.monthKey,
      overspentAmount: data.overspentAmount,
      gambleAmount: data.gambleAmount,
      status: 'active',
      createdAt: Date.now(),
      notes: data.notes || '',
    };

    if (!household.gambles) household.gambles = [];
    household.gambles.unshift(newGamble);

    await updateDoc(householdRef, { gambles: household.gambles });
    return { gamble: newGamble, household };
  },

  // Resolve Gamble
  async resolveGamble(
    householdId: string,
    gambleId: string,
    status: 'won' | 'lost',
    scoreImpact: number
  ): Promise<{ gamble: WeekGamble; household: Household }> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (!householdSnap.exists()) throw new Error('Household not found');

    const household = householdSnap.data() as Household;
    const gamble = household.gambles?.find((g) => g.id === gambleId);
    if (!gamble) throw new Error('Gamble not found');

    gamble.status = status;
    gamble.scoreImpact = scoreImpact;
    gamble.resolvedAt = Date.now();

    if (!household.score) {
      household.score = { totalPoints: 0, currentStreakWeeks: 0, bestStreakWeeks: 0, history: [] };
    }
    household.score.totalPoints = Math.max(0, household.score.totalPoints + scoreImpact);

    await updateDoc(householdRef, {
      gambles: household.gambles,
      score: household.score,
    });

    return { gamble, household };
  },

  // Record Week Score
  async recordWeekScore(householdId: string, weekRecord: WeekScoreRecord): Promise<{ household: Household }> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (!householdSnap.exists()) throw new Error('Household not found');

    const household = householdSnap.data() as Household;
    if (!household.score) {
      household.score = { totalPoints: 0, currentStreakWeeks: 0, bestStreakWeeks: 0, history: [] };
    }

    const existingIdx = household.score.history.findIndex(
      (h) => h.monthKey === weekRecord.monthKey && h.weekNumber === weekRecord.weekNumber
    );

    if (existingIdx >= 0) {
      const oldScore = household.score.history[existingIdx].totalWeekScore;
      household.score.totalPoints = Math.max(0, household.score.totalPoints - oldScore + weekRecord.totalWeekScore);
      household.score.history[existingIdx] = weekRecord;
    } else {
      household.score.totalPoints += weekRecord.totalWeekScore;
      household.score.history.unshift(weekRecord);
    }

    if (weekRecord.netDiff >= 0) {
      household.score.currentStreakWeeks += 1;
      if (household.score.currentStreakWeeks > household.score.bestStreakWeeks) {
        household.score.bestStreakWeeks = household.score.currentStreakWeeks;
      }
    } else {
      household.score.currentStreakWeeks = 0;
    }

    await updateDoc(householdRef, { score: household.score });
    return { household };
  },

  // Real-time Chat Subscription
  subscribeToMessages(householdId: string, onUpdate: (messages: ChatMessage[]) => void): () => void {
    const q = query(collection(db, 'messages'), where('householdId', '==', householdId));
    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push(docSnap.data() as ChatMessage);
        });
        msgs.sort((a, b) => a.createdAt - b.createdAt);
        onUpdate(msgs);
      },
      (error) => {
        console.error('Error subscribing to messages:', error);
      }
    );
  },

  // Fetch all messages once
  async fetchMessages(householdId: string): Promise<ChatMessage[]> {
    const q = query(collection(db, 'messages'), where('householdId', '==', householdId));
    const snap = await getDocs(q);
    const msgs: ChatMessage[] = [];
    snap.forEach((docSnap) => {
      msgs.push(docSnap.data() as ChatMessage);
    });
    msgs.sort((a, b) => a.createdAt - b.createdAt);
    return msgs;
  },

  // Send a new Chat Message (Text, GIF, or Attached Transaction)
  async sendMessage(data: {
    householdId: string;
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
    content?: string;
    gifUrl?: string;
    gifTitle?: string;
    attachedTransaction?: Transaction;
  }): Promise<{ message: ChatMessage }> {
    const msgId = 'msg-' + Math.random().toString(36).substring(2, 9);
    const newMsg: ChatMessage = {
      id: msgId,
      householdId: data.householdId,
      partnerId: data.partnerId,
      partnerName: data.partnerName,
      partnerAvatar: data.partnerAvatar,
      content: data.content || '',
      gifUrl: data.gifUrl,
      gifTitle: data.gifTitle,
      attachedTransaction: data.attachedTransaction,
      reactions: {},
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'messages', msgId), newMsg);
    return { message: newMsg };
  },

  // Toggle Reaction on a Chat Message
  async toggleMessageReaction(messageId: string, partnerId: string, emoji: string): Promise<{ message: ChatMessage }> {
    const msgRef = doc(db, 'messages', messageId);
    const msgSnap = await getDoc(msgRef);
    if (!msgSnap.exists()) throw new Error('Message not found');

    const msg = msgSnap.data() as ChatMessage;
    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[partnerId]) msg.reactions[partnerId] = [];

    const idx = msg.reactions[partnerId].indexOf(emoji);
    if (idx >= 0) {
      msg.reactions[partnerId].splice(idx, 1);
    } else {
      msg.reactions[partnerId].push(emoji);
    }

    await updateDoc(msgRef, { reactions: msg.reactions });
    return { message: msg };
  },

  // Delete a Chat Message
  async deleteMessage(messageId: string): Promise<boolean> {
    const msgRef = doc(db, 'messages', messageId);
    await deleteDoc(msgRef);
    return true;
  },

  // Fetch only transactions for a household
  async fetchTransactions(householdId: string): Promise<{ transactions: Transaction[] }> {
    const txQuery = query(collection(db, 'transactions'), where('householdId', '==', householdId));
    const txDocs = await getDocs(txQuery);
    const transactions: Transaction[] = [];
    txDocs.forEach((d) => {
      transactions.push(d.data() as Transaction);
    });
    transactions.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt));
    return { transactions };
  },

  // Toggle or Complete a Sponge Task
  async toggleSpongeTask(
    householdId: string,
    spongeId: string,
    taskId: string,
    partnerId: string = 'partner1'
  ): Promise<{ household: Household; sponge: any; isExpungedNow: boolean }> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (!householdSnap.exists()) throw new Error('Household not found');

    const household = householdSnap.data() as Household;
    const sponges = household.sponges || [];
    const sponge = sponges.find((s) => s.id === spongeId);
    if (!sponge) throw new Error('Sponge not found');

    const task = sponge.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const wasCompleted = task.completed;
    task.completed = !wasCompleted;
    if (task.completed) {
      task.completedAt = Date.now();
      task.completedByPartnerId = partnerId;
      if (!household.score) {
        household.score = { totalPoints: 0, currentStreakWeeks: 0, bestStreakWeeks: 0, history: [] };
      }
      household.score.totalPoints += task.pointsRestored;
    } else {
      task.completedAt = undefined;
      task.completedByPartnerId = undefined;
      if (household.score) {
        household.score.totalPoints = Math.max(0, household.score.totalPoints - task.pointsRestored);
      }
    }

    // Check if all tasks completed
    const allDone = sponge.tasks.every((t) => t.completed);
    let isExpungedNow = false;
    if (allDone && sponge.status === 'active') {
      sponge.status = 'expunged';
      sponge.expungedAt = Date.now();
      isExpungedNow = true;
      // Bonus redemption points for completing entire sponge cleanse!
      household.score.totalPoints += 50;

      // Add badge
      if (!household.unlockedBadgeIds) household.unlockedBadgeIds = [];
      if (!household.unlockedBadgeIds.includes('sponge_expunged')) {
        household.unlockedBadgeIds.push('sponge_expunged');
      }
    } else if (!allDone && sponge.status === 'expunged') {
      sponge.status = 'active';
      sponge.expungedAt = undefined;
      household.score.totalPoints = Math.max(0, household.score.totalPoints - 50);
    }

    await updateDoc(householdRef, {
      sponges,
      score: household.score,
      unlockedBadgeIds: household.unlockedBadgeIds || [],
    });

    return { household, sponge, isExpungedNow };
  },

  // Add Negative Sponge
  async addNegativeSponge(householdId: string, sponge: any): Promise<{ household: Household }> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (!householdSnap.exists()) throw new Error('Household not found');

    const household = householdSnap.data() as Household;
    if (!household.sponges) household.sponges = [];
    household.sponges.unshift(sponge);

    // Apply penalty points
    if (!household.score) {
      household.score = { totalPoints: 0, currentStreakWeeks: 0, bestStreakWeeks: 0, history: [] };
    }
    household.score.totalPoints = Math.max(0, household.score.totalPoints - (sponge.penaltyPoints || 50));

    await updateDoc(householdRef, {
      sponges: household.sponges,
      score: household.score,
    });

    return { household };
  },
};

