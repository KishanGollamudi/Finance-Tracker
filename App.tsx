import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AIAdvisor from './components/AIAdvisor';
import { getTransactions, saveTransactions, getCategories, saveCategories, getSettings, saveSettings, clearData } from './services/storage';
import { Transaction, Category, AppSettings, View } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ currency: 'USD', monthlyBudget: 0 });

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load Data
  useEffect(() => {
    setTransactions(getTransactions());
    setCategories(getCategories());
    setSettings(getSettings());
  }, []);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    let updated: Transaction[];
    if (editingTransaction) {
      updated = transactions.map(t => t.id === editingTransaction.id ? { ...newTransaction, id: t.id } : t);
      setEditingTransaction(null);
    } else {
      updated = [{ ...newTransaction, id: crypto.randomUUID() }, ...transactions];
    }
    setTransactions(updated);
    saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      saveTransactions(updated);
    }
  };

  const openAddForm = (type: 'income' | 'expense') => {
    setEditingTransaction(null);
    setFormType(type);
    setIsFormOpen(true);
  };

  const openEditForm = (t: Transaction) => {
    setEditingTransaction(t);
    setFormType(t.type);
    setIsFormOpen(true);
  };

  const handleSaveSettings = (s: AppSettings) => {
    setSettings(s);
    saveSettings(s);
  };

  const handleSaveCategories = (c: Category[]) => {
    setCategories(c);
    saveCategories(c);
  };

  return (
    <div className="flex h-screen bg-[#F8F4EF] text-[#7C5A3A] overflow-hidden">
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Wrapper for Mobile */}
      <div className={`fixed inset-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out md:flex md:w-auto`}>
        <Sidebar currentView={view} onChangeView={(v) => { setView(v); setIsMobileMenuOpen(false); }} />
        {/* Overlay for mobile */}
        {isMobileMenuOpen && <div className="absolute inset-0 bg-black/20 -z-10 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
          {view === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              settings={settings} 
              onAddTransaction={openAddForm} 
            />
          )}
          
          {view === 'transactions' && (
            <TransactionList 
              transactions={transactions} 
              categories={categories}
              onEdit={openEditForm}
              onDelete={deleteTransaction}
            />
          )}

          {view === 'reports' && (
            <Reports transactions={transactions} />
          )}

          {view === 'ai-advisor' && (
            <AIAdvisor transactions={transactions} />
          )}

          {view === 'settings' && (
            <Settings 
              settings={settings}
              categories={categories}
              onSaveSettings={handleSaveSettings}
              onSaveCategories={handleSaveCategories}
              onClearData={clearData}
            />
          )}
        </div>
      </main>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleAddTransaction}
        categories={categories}
        initialType={formType}
        initialData={editingTransaction}
        defaultCurrency={settings.currency}
      />
    </div>
  );
};

export default App;