export interface Transaction {
  id: string;
  date: string;
  type: 'expense' | 'income';
  amount: number;
  currency: string; // ISO 4217 code
  category: string;
  paymentMethod: string;
  merchant: string;
  notes?: string;
  receipt?: string; // base64 or placeholder
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

export interface AppSettings {
  currency: string;
  monthlyBudget: number;
}

export type View = 'dashboard' | 'transactions' | 'reports' | 'settings' | 'ai-advisor';