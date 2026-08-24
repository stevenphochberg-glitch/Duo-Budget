import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_SUBCATEGORIES } from './src/utils/budgetCalculations';

const app = express();
const PORT = 3000;

app.use(express.json());

// Database storage setup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    name: string;
    partnerId: string; // 'partner1' or 'partner2'
    householdId: string;
    password: string;
  }>;
  households: Record<string, any>;
  transactions: Array<any>;
}

function getInitialDatabase(): DatabaseSchema {
  const demoHouseholdId = 'demo-household-123';
  const now = Date.now();
  const currentYear = 2026;
  const currentMonth = '08';

  const defaultHousehold = {
    id: demoHouseholdId,
    name: 'Alex & Jordan Home',
    inviteCode: 'COUPLE-789',
    createdAt: now - 30 * 24 * 60 * 60 * 1000,
    settings: {
      calendarMode: 'calendar',
      firstDayOfWeek: 1, // Monday
      currencySymbol: '$',
      partner1: {
        id: 'partner1',
        name: 'Alex',
        avatarEmoji: '🦊',
        color: '#f97316', // Orange
      },
      partner2: {
        id: 'partner2',
        name: 'Jordan',
        avatarEmoji: '🐼',
        color: '#06b6d4', // Cyan
      },
    },
    subcategories: DEFAULT_SUBCATEGORIES,
    score: {
      totalPoints: 340,
      currentStreakWeeks: 2,
      bestStreakWeeks: 3,
      history: [
        {
          weekNumber: 1,
          monthKey: '2026-08',
          weekLabel: 'Week 1 (Aug 1 - 7)',
          totalBudget: 1100,
          totalSpent: 980,
          netDiff: 120,
          basePoints: 120,
          streakWeekCount: 1,
          streakBonusPercent: 0,
          streakBonusPoints: 0,
          gambleImpact: 0,
          totalWeekScore: 120,
          evaluatedAt: now - 14 * 24 * 60 * 60 * 1000,
        },
        {
          weekNumber: 2,
          monthKey: '2026-08',
          weekLabel: 'Week 2 (Aug 8 - 14)',
          totalBudget: 1140,
          totalSpent: 930,
          netDiff: 210,
          basePoints: 210,
          streakWeekCount: 2,
          streakBonusPercent: 5,
          streakBonusPoints: 10,
          gambleImpact: 0,
          totalWeekScore: 220,
          evaluatedAt: now - 7 * 24 * 60 * 60 * 1000,
        },
      ],
    },
    gambles: [
      {
        id: 'gamble-demo-1',
        householdId: demoHouseholdId,
        partnerId: 'partner1',
        weekNumber: 3,
        monthKey: '2026-08',
        overspentAmount: 85,
        gambleAmount: 85,
        status: 'active',
        createdAt: now - 2 * 24 * 60 * 60 * 1000,
        notes: 'Betting we can cook at home the rest of August to erase the dinner date overage!',
      },
    ],
  };

  const demoUsers = [
    {
      id: 'user-alex',
      email: 'alex@example.com',
      name: 'Alex',
      partnerId: 'partner1',
      householdId: demoHouseholdId,
      password: 'password123',
    },
    {
      id: 'user-jordan',
      email: 'jordan@example.com',
      name: 'Jordan',
      partnerId: 'partner2',
      householdId: demoHouseholdId,
      password: 'password123',
    },
  ];

  const demoTransactions = [
    // Week 3 sample transactions (current week)
    {
      id: 't-101',
      householdId: demoHouseholdId,
      partnerId: 'partner1',
      partnerName: 'Alex',
      mainCategory: 'required',
      subcategoryId: 'groceries',
      subcategoryName: 'Groceries & Household Essentials',
      amount: 142.5,
      date: '2026-08-18',
      note: "Trader Joe's weekly haul & pantry staples",
      spendingType: 'variable',
      reactions: { partner2: ['😍', '👏'] },
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
    },
    {
      id: 't-102',
      householdId: demoHouseholdId,
      partnerId: 'partner2',
      partnerName: 'Jordan',
      mainCategory: 'discretionary',
      subcategoryId: 'discretionary_fun',
      subcategoryName: 'Discretionary (Fun Spending)',
      amount: 48.0,
      date: '2026-08-19',
      note: 'Saturday artisan coffee & pastries date',
      spendingType: 'variable',
      reactions: { partner1: ['❤️', '☕'] },
      createdAt: now - 1 * 24 * 60 * 60 * 1000,
    },
    {
      id: 't-103',
      householdId: demoHouseholdId,
      partnerId: 'partner1',
      partnerName: 'Alex',
      mainCategory: 'required',
      subcategoryId: 'gas',
      subcategoryName: 'Gas & Transit',
      amount: 52.0,
      date: '2026-08-16',
      note: 'Chevron gas tank fill-up for commute',
      spendingType: 'variable',
      reactions: { partner2: ['👍'] },
      createdAt: now - 4 * 24 * 60 * 60 * 1000,
    },
    {
      id: 't-104',
      householdId: demoHouseholdId,
      partnerId: 'partner2',
      partnerName: 'Jordan',
      mainCategory: 'required',
      subcategoryId: 'utilities',
      subcategoryName: 'Utilities (Electric, Water, Gas)',
      amount: 45.0,
      date: '2026-08-17',
      note: 'Summer air conditioning surcharge (variable overage)',
      spendingType: 'hybrid',
      reactions: { partner1: ['💸'] },
      createdAt: now - 3 * 24 * 60 * 60 * 1000,
    },
    {
      id: 't-105',
      householdId: demoHouseholdId,
      partnerId: 'partner1',
      partnerName: 'Alex',
      mainCategory: 'reserved',
      subcategoryId: 'investing',
      subcategoryName: 'Investing (Roth IRA / Index)',
      amount: 100.0,
      date: '2026-08-15',
      note: 'Bi-weekly automated VOO index fund deposit',
      spendingType: 'variable',
      reactions: { partner2: ['🔥', '👏'] },
      createdAt: now - 5 * 24 * 60 * 60 * 1000,
    },
    {
      id: 't-107',
      householdId: demoHouseholdId,
      partnerId: 'partner1',
      partnerName: 'Alex',
      mainCategory: 'required',
      subcategoryId: 'bills',
      subcategoryName: 'Bills (Internet, Cell, Insurance)',
      amount: 35.0,
      date: '2026-08-05',
      note: 'International roaming day pass add-on (variable overage)',
      spendingType: 'hybrid',
      reactions: { partner2: ['👍'] },
      createdAt: now - 15 * 24 * 60 * 60 * 1000,
    },
  ];

  return {
    users: demoUsers,
    households: {
      [demoHouseholdId]: defaultHousehold,
    },
    transactions: demoTransactions,
  };
}

function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db.json, reinitializing...', err);
  }
  const initial = getInitialDatabase();
  saveDB(initial);
  return initial;
}

function saveDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// In-memory cache synced with disk
let db = loadDB();

// API Routes
// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Demo login (instant couple experience)
app.post('/api/auth/demo', (req, res) => {
  const partnerRole = req.body.partnerId === 'partner2' ? 'partner2' : 'partner1';
  const user = db.users.find((u) => u.householdId === 'demo-household-123' && u.partnerId === partnerRole) || db.users[0];
  const household = db.households[user.householdId];
  res.json({
    user,
    household,
  });
});

// 3. Register a new couple / household
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, partner1Name, partner1Emoji, partner1Color, partner2Name, partner2Emoji, partner2Color } = req.body;

  if (!email || !password || !partner1Name) {
    return res.status(400).json({ error: 'Email, password, and partner name are required' });
  }

  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const householdId = 'hh-' + Math.random().toString(36).substring(2, 9);
  const inviteCode = 'PAIR-' + Math.floor(1000 + Math.random() * 9000);
  const userId = 'usr-' + Math.random().toString(36).substring(2, 9);

  const newHousehold = {
    id: householdId,
    name: `${partner1Name} & ${partner2Name || 'Partner'} Budget`,
    inviteCode,
    createdAt: Date.now(),
    settings: {
      calendarMode: 'calendar',
      firstDayOfWeek: 1,
      currencySymbol: '$',
      partner1: {
        id: 'partner1',
        name: partner1Name,
        avatarEmoji: partner1Emoji || '🦊',
        color: partner1Color || '#f97316',
      },
      partner2: {
        id: 'partner2',
        name: partner2Name || 'Partner',
        avatarEmoji: partner2Emoji || '🐼',
        color: partner2Color || '#06b6d4',
      },
    },
    subcategories: DEFAULT_SUBCATEGORIES,
    score: {
      totalPoints: 100,
      currentStreakWeeks: 0,
      bestStreakWeeks: 0,
      history: [],
    },
    gambles: [],
  };

  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    name: partner1Name,
    partnerId: 'partner1',
    householdId,
    password,
  };

  db.households[householdId] = newHousehold;
  db.users.push(newUser);
  saveDB(db);

  res.json({
    user: newUser,
    household: newHousehold,
  });
});

// 4. Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, partnerId } = req.body;
  const user = db.users.find(
    (u) => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Allow switching partner identity on login if requested
  if (partnerId && (partnerId === 'partner1' || partnerId === 'partner2')) {
    user.partnerId = partnerId;
    const hh = db.households[user.householdId];
    if (hh) {
      user.name = partnerId === 'partner1' ? hh.settings.partner1.name : hh.settings.partner2.name;
    }
  }

  const household = db.households[user.householdId];
  res.json({ user, household });
});

// 5. Join existing household with Invite Code
app.post('/api/auth/join', (req, res) => {
  const { email, password, name, inviteCode, partnerId } = req.body;
  const cleanCode = (inviteCode || '').trim().toUpperCase();

  const household = Object.values(db.households).find((h: any) => h.inviteCode.toUpperCase() === cleanCode);
  if (!household) {
    return res.status(404).json({ error: 'Household invite code not found' });
  }

  const chosenPartnerId = partnerId === 'partner1' ? 'partner1' : 'partner2';
  const userId = 'usr-' + Math.random().toString(36).substring(2, 9);
  const newUser = {
    id: userId,
    email: (email || `${name.toLowerCase()}@partner.local`).toLowerCase(),
    name: name || (chosenPartnerId === 'partner1' ? household.settings.partner1.name : household.settings.partner2.name),
    partnerId: chosenPartnerId,
    householdId: household.id,
    password: password || 'joined-pass',
  };

  // Update partner name in settings if provided
  if (name) {
    if (chosenPartnerId === 'partner1') household.settings.partner1.name = name;
    else household.settings.partner2.name = name;
  }

  db.users.push(newUser);
  saveDB(db);

  res.json({ user: newUser, household });
});

// 6. Get household data & transactions
app.get('/api/household/:id', (req, res) => {
  const { id } = req.params;
  const household = db.households[id];
  if (!household) {
    return res.status(404).json({ error: 'Household not found' });
  }
  const transactions = db.transactions.filter((t) => t.householdId === id);
  res.json({ household, transactions });
});

// 7. Update household settings
app.put('/api/household/:id/settings', (req, res) => {
  const { id } = req.params;
  const household = db.households[id];
  if (!household) {
    return res.status(404).json({ error: 'Household not found' });
  }

  household.settings = {
    ...household.settings,
    ...req.body,
  };
  saveDB(db);
  res.json({ household });
});

// 8. Update subcategories configuration (budgets, types, hybrid minimums)
app.put('/api/household/:id/subcategories', (req, res) => {
  const { id } = req.params;
  const household = db.households[id];
  if (!household) {
    return res.status(404).json({ error: 'Household not found' });
  }

  household.subcategories = req.body.subcategories;
  saveDB(db);
  res.json({ household });
});

// 9. Add transaction
app.post('/api/transactions', (req, res) => {
  const { householdId, partnerId, partnerName, mainCategory, subcategoryId, subcategoryName, amount, date, note, spendingType, isFixedBaseAllocation } = req.body;

  if (!householdId || !amount || !date || !mainCategory) {
    return res.status(400).json({ error: 'Missing required transaction fields' });
  }

  const household = db.households[householdId];
  if (household) {
    const sub = household.subcategories?.find((s: any) => s.id === subcategoryId);
    if (sub && sub.spendingType === 'fixed') {
      return res.status(400).json({
        error: 'Fixed cost expenses are automatically prorated for each week and cannot be manually logged.',
      });
    }
  }

  if (spendingType === 'fixed') {
    return res.status(400).json({
      error: 'Fixed cost expenses are automatically prorated for each week and cannot be manually logged.',
    });
  }

  const newTx = {
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    householdId,
    partnerId: partnerId || 'partner1',
    partnerName: partnerName || 'Partner',
    mainCategory,
    subcategoryId: subcategoryId || 'discretionary_fun',
    subcategoryName: subcategoryName || 'Discretionary',
    amount: Math.abs(Number(amount)),
    date,
    note: note || '',
    spendingType: spendingType || 'variable',
    isFixedBaseAllocation: !!isFixedBaseAllocation,
    reactions: {},
    createdAt: Date.now(),
  };

  db.transactions.unshift(newTx);
  saveDB(db);
  res.json({ transaction: newTx });
});

// 10. Edit transaction
app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.transactions.findIndex((t) => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  db.transactions[idx] = {
    ...db.transactions[idx],
    ...req.body,
    amount: Math.abs(Number(req.body.amount || db.transactions[idx].amount)),
  };
  saveDB(db);
  res.json({ transaction: db.transactions[idx] });
});

// 11. Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.transactions = db.transactions.filter((t) => t.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// 12. Toggle emoji reaction on a transaction
app.post('/api/transactions/:id/reaction', (req, res) => {
  const { id } = req.params;
  const { partnerId, emoji } = req.body;

  const tx = db.transactions.find((t) => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (!tx.reactions) {
    tx.reactions = {};
  }
  if (!tx.reactions[partnerId]) {
    tx.reactions[partnerId] = [];
  }

  const existingIdx = tx.reactions[partnerId].indexOf(emoji);
  if (existingIdx > -1) {
    tx.reactions[partnerId].splice(existingIdx, 1);
  } else {
    tx.reactions[partnerId].push(emoji);
  }

  saveDB(db);
  res.json({ transaction: tx });
});

// 13. Place a Gamble for an overspent week
app.post('/api/gamification/gamble', (req, res) => {
  const { householdId, partnerId, weekNumber, monthKey, overspentAmount, gambleAmount, notes } = req.body;
  const household = db.households[householdId];
  if (!household) {
    return res.status(404).json({ error: 'Household not found' });
  }

  const newGamble = {
    id: 'gamble-' + Math.random().toString(36).substring(2, 9),
    householdId,
    partnerId: partnerId || 'partner1',
    weekNumber,
    monthKey,
    overspentAmount: Number(overspentAmount),
    gambleAmount: Number(gambleAmount),
    status: 'active',
    createdAt: Date.now(),
    notes: notes || '',
  };

  if (!household.gambles) household.gambles = [];
  household.gambles.push(newGamble);
  saveDB(db);
  res.json({ gamble: newGamble, household });
});

// 14. Resolve a Gamble outcome
app.post('/api/gamification/resolve-gamble', (req, res) => {
  const { householdId, gambleId, status, scoreImpact } = req.body;
  const household = db.households[householdId];
  if (!household) {
    return res.status(404).json({ error: 'Household not found' });
  }

  const gamble = (household.gambles || []).find((g: any) => g.id === gambleId);
  if (!gamble) {
    return res.status(404).json({ error: 'Gamble not found' });
  }

  gamble.status = status; // 'won' or 'lost'
  gamble.resolvedAt = Date.now();
  gamble.scoreImpact = scoreImpact;

  household.score.totalPoints = Math.max(0, household.score.totalPoints + scoreImpact);
  saveDB(db);
  res.json({ gamble, household });
});

// 15. Record week score & streak updates
app.post('/api/gamification/record-week', (req, res) => {
  const { householdId, weekRecord } = req.body;
  const household = db.households[householdId];
  if (!household) {
    return res.status(404).json({ error: 'Household not found' });
  }

  if (!household.score.history) household.score.history = [];
  // check if already recorded
  const existingIdx = household.score.history.findIndex(
    (h: any) => h.weekNumber === weekRecord.weekNumber && h.monthKey === weekRecord.monthKey
  );

  if (existingIdx > -1) {
    household.score.history[existingIdx] = weekRecord;
  } else {
    household.score.history.push(weekRecord);
  }

  household.score.totalPoints = Math.max(0, household.score.totalPoints + weekRecord.totalWeekScore);
  household.score.currentStreakWeeks = weekRecord.streakWeekCount;
  if (weekRecord.streakWeekCount > household.score.bestStreakWeeks) {
    household.score.bestStreakWeeks = weekRecord.streakWeekCount;
  }

  saveDB(db);
  res.json({ household });
});

// Start Server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Couple Budget server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
