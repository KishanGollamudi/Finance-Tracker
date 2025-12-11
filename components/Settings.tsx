import React, { useState } from 'react';
import { AppSettings, Category } from '../types';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { CURRENCIES } from '../services/currency';

interface SettingsProps {
  settings: AppSettings;
  categories: Category[];
  onSaveSettings: (s: AppSettings) => void;
  onSaveCategories: (c: Category[]) => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, categories, onSaveSettings, onSaveCategories, onClearData }) => {
  const [budget, setBudget] = useState(settings.monthlyBudget);
  const [currency, setCurrency] = useState(settings.currency);
  const [newCat, setNewCat] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');

  const handleSaveSettings = () => {
    onSaveSettings({ ...settings, monthlyBudget: budget, currency });
    alert('Settings Saved!');
  };

  const addCategory = () => {
    if (!newCat) return;
    onSaveCategories([...categories, { id: crypto.randomUUID(), name: newCat, type: newCatType }]);
    setNewCat('');
  };

  const removeCategory = (id: string) => {
    onSaveCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-3xl font-script text-beige-800">Settings</h2>
          <p className="text-beige-600 text-sm">Customize your ledger.</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100">
          <h3 className="text-lg font-bold text-beige-800 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-beige-500 uppercase">Monthly Budget</label>
              <div className="flex items-center mt-1">
                 <span className="px-3 py-2 bg-beige-100 border border-r-0 border-beige-200 rounded-l-lg text-beige-600 font-medium">
                    {currency}
                 </span>
                 <input 
                    type="number" 
                    value={budget}
                    onChange={e => setBudget(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-beige-50 border border-beige-200 rounded-r-lg text-beige-800 focus:outline-none focus:ring-2 focus:ring-beige-400"
                 />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-beige-500 uppercase">Default Currency</label>
              <select 
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg text-beige-800 focus:outline-none focus:ring-2 focus:ring-beige-400"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleSaveSettings}
              className="w-full py-2 bg-beige-500 text-white rounded-lg hover:bg-beige-600 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
           <h3 className="text-lg font-bold text-red-800 mb-4">Danger Zone</h3>
           <p className="text-sm text-gray-500 mb-4">Clear all local data and reset to demo state.</p>
           <button 
             onClick={() => { if(confirm('Are you sure?')) onClearData(); }}
             className="flex items-center justify-center w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
           >
             <AlertCircle size={16} className="mr-2" /> Reset Application
           </button>
        </div>

        {/* Category Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100 md:col-span-2">
          <h3 className="text-lg font-bold text-beige-800 mb-4">Manage Categories</h3>
          
          <div className="flex space-x-2 mb-6">
            <input 
              type="text" 
              placeholder="New Category Name" 
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              className="flex-1 px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg focus:outline-none"
            />
            <select 
              value={newCatType}
              onChange={e => setNewCatType(e.target.value as 'income' | 'expense')}
              className="px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg focus:outline-none"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <button 
              onClick={addCategory}
              className="p-2 bg-beige-500 text-white rounded-lg hover:bg-beige-600"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-beige-50 rounded-lg border border-beige-100 group">
                <span className="text-sm text-beige-800 font-medium">
                  {c.name} <span className="text-xs text-beige-400 font-normal ml-1">({c.type})</span>
                </span>
                <button 
                  onClick={() => removeCategory(c.id)}
                  className="text-beige-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;