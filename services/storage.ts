import { Transaction, Category, AppSettings } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'beigeledger_transactions',
  CATEGORIES: 'beigeledger_categories',
  SETTINGS: 'beigeledger_settings',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Housing', type: 'expense' },
  { id: '2', name: 'Food & Dining', type: 'expense' },
  { id: '3', name: 'Transportation', type: 'expense' },
  { id: '4', name: 'Utilities', type: 'expense' },
  { id: '5', name: 'Shopping', type: 'expense' },
  { id: '6', name: 'Salary', type: 'income' },
  { id: '7', name: 'Freelance', type: 'income' },
  { id: '8', name: 'Investments', type: 'income' },
];

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  monthlyBudget: 3000,
};

const generateDemoData = (): Transaction[] => {
  const data: Transaction[] = [];
  const categories = DEFAULT_CATEGORIES.filter(c => c.type === 'expense');
  const incomes = DEFAULT_CATEGORIES.filter(c => c.type === 'income');
  const merchants = ['Amazon', 'Whole Foods', 'Uber', 'Starbucks', 'Shell', 'Netflix', 'Target', 'Local Bakery', 'Japan Rail', 'London Tube', 'Paris Bistro'];
  const paymentMethods = ['Card', 'Cash', 'UPI'];
  const currencies = ['USD', 'USD', 'USD', 'EUR', 'GBP', 'INR', 'JPY']; // Weighted towards USD

  const now = new Date();
  
  // Generate 40 transactions over the last 3 months
  for (let i = 0; i < 40; i++) {
    const isIncome = Math.random() > 0.8;
    const catList = isIncome ? incomes : categories;
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.floor(Math.random() * 90));
    const currency = currencies[Math.floor(Math.random() * currencies.length)];

    let amountBase = isIncome ? Math.floor(Math.random() * 2000) + 1000 : Math.floor(Math.random() * 200) + 5;
    
    // Adjust scale for high-denomination currencies crudely
    if (currency === 'INR' || currency === 'JPY' || currency === 'KRW') {
        amountBase = amountBase * 80;
    }

    data.push({
      id: crypto.randomUUID(),
      date: date.toISOString().split('T')[0],
      type: isIncome ? 'income' : 'expense',
      amount: amountBase,
      currency: currency,
      category: catList[Math.floor(Math.random() * catList.length)].name,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      merchant: isIncome ? 'Employer' : merchants[Math.floor(Math.random() * merchants.length)],
      notes: isIncome ? 'Monthly payment' : 'Regular purchase',
    });
  }
  
  // Sort by date desc
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!stored) {
    const demo = generateDemoData();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(demo));
    return demo;
  }
  
  const parsed = JSON.parse(stored);
  // Migration: Ensure all transactions have a currency field (default USD if missing)
  return parsed.map((t: any) => ({
      ...t,
      currency: t.currency || 'USD'
  }));
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(stored);
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(stored);
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  window.location.reload();
};