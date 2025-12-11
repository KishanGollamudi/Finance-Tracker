import React, { useState, useEffect } from 'react';
import { Transaction, Category, AppSettings } from '../types';
import { X, Upload, Save } from 'lucide-react';
import { CURRENCIES } from '../services/currency';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  initialType?: 'income' | 'expense';
  initialData?: Transaction | null;
  defaultCurrency: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  isOpen, onClose, onSubmit, categories, initialType = 'expense', initialData, defaultCurrency 
}) => {
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setDate(initialData.date);
        setAmount(initialData.amount.toString());
        setCurrency(initialData.currency || defaultCurrency);
        setCategory(initialData.category);
        setPaymentMethod(initialData.paymentMethod);
        setMerchant(initialData.merchant);
        setNotes(initialData.notes || '');
      } else {
        setType(initialType);
        setDate(new Date().toISOString().split('T')[0]);
        setAmount('');
        setCurrency(defaultCurrency);
        setCategory('');
        setPaymentMethod('Card');
        setMerchant('');
        setNotes('');
        setFileName('');
      }
    }
  }, [isOpen, initialType, initialData, defaultCurrency]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      date,
      amount: parseFloat(amount),
      currency,
      category: category || (type === 'income' ? 'Other Income' : 'Uncategorized'),
      paymentMethod,
      merchant: merchant || 'Unknown',
      notes,
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-beige-200 animate-in fade-in zoom-in duration-200">
        <div className="bg-beige-100 p-4 border-b border-beige-200 flex justify-between items-center">
          <h2 className="text-xl font-script text-beige-800 text-2xl">
            {initialData ? 'Edit Transaction' : type === 'expense' ? 'Add Expense' : 'Add Income'}
          </h2>
          <button onClick={onClose} className="text-beige-600 hover:text-beige-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2 flex space-x-2 bg-beige-50 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-beige-600 hover:bg-beige-100'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-beige-600 hover:bg-beige-100'}`}
                >
                  Income
                </button>
             </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-beige-600 uppercase tracking-wider">Date</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-400 text-beige-800"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-beige-600 uppercase tracking-wider">Amount</label>
              <div className="flex space-x-1">
                 <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-20 px-1 py-2 bg-beige-100 border border-beige-200 rounded-lg text-xs font-mono focus:outline-none"
                 >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                 </select>
                 <input 
                    type="number" 
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-400 text-beige-800 font-mono"
                    placeholder="0.00"
                 />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-beige-600 uppercase tracking-wider">Category</label>
            <div className="relative">
              <input
                list="category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select or type new..."
                className="w-full px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-400 text-beige-800"
              />
              <datalist id="category-options">
                {filteredCategories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-semibold text-beige-600 uppercase tracking-wider">Merchant / Source</label>
             <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder={type === 'income' ? "e.g. Employer, Client" : "e.g. Starbucks, Amazon"}
                className="w-full px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-400 text-beige-800"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-beige-600 uppercase tracking-wider">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-400 text-beige-800"
                >
                  <option>Card</option>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                </select>
            </div>
            
            <div className="space-y-1">
                <label className="text-xs font-semibold text-beige-600 uppercase tracking-wider">Receipt</label>
                <div className="relative">
                  <input
                    type="file"
                    id="receipt-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  <label htmlFor="receipt-upload" className="flex items-center justify-center w-full px-3 py-2 bg-beige-50 border border-dashed border-beige-300 rounded-lg cursor-pointer hover:bg-beige-100 transition-colors text-beige-600 text-sm truncate">
                     <Upload size={14} className="mr-2" />
                     {fileName || 'Upload'}
                  </label>
                </div>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-semibold text-beige-600 uppercase tracking-wider">Notes</label>
             <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-400 text-beige-800 resize-none"
             />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-beige-500 hover:bg-beige-600 text-white font-semibold rounded-xl shadow-lg shadow-beige-500/30 transition-all flex items-center justify-center"
          >
            <Save size={18} className="mr-2" />
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;