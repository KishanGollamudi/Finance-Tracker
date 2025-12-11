import React from 'react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { convertAmount, formatCurrency } from '../services/currency';
import { getSettings } from '../services/storage';

interface ReportsProps {
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const settings = getSettings();
  const defaultCurr = settings.currency;

  // Daily Spending for current month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const spending = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getDate() === day && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
      })
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', defaultCurr), 0);
    return { day: day.toString(), amount: spending };
  });

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-3xl font-script text-beige-800">Visualizer</h2>
          <p className="text-beige-600 text-sm">Deep dive into your daily habits. Shown in {defaultCurr}.</p>
        </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100">
        <h3 className="text-lg font-semibold text-beige-800 mb-6">Daily Spending (Current Month)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{fill: '#9CA3AF', fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#F8F4EF'}}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [formatCurrency(value, defaultCurr), 'Spending']}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {dailyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.amount > 200 ? '#7C5A3A' : '#C9A66B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center text-xs text-beige-400">
           Bars darker in color indicate high spending days
        </div>
      </div>
    </div>
  );
};

export default Reports;