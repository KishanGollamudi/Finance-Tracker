import React from 'react';
import { Transaction, AppSettings } from '../types';
import { convertAmount, getCurrencySymbol, formatCurrency } from '../services/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, Plus } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  settings: AppSettings;
  onAddTransaction: (type: 'income' | 'expense') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, settings, onAddTransaction }) => {
  // Calculate Totals for current month in Default Currency
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const defaultCurr = settings.currency;
  const symbol = getCurrencySymbol(defaultCurr);

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + convertAmount(curr.amount, curr.currency || 'USD', defaultCurr), 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + convertAmount(curr.amount, curr.currency || 'USD', defaultCurr), 0);

  const balance = totalIncome - totalExpense;
  const budgetProgress = settings.monthlyBudget > 0 ? Math.min((totalExpense / settings.monthlyBudget) * 100, 100) : 0;

  // Chart Data Preparation (Converted)
  const categoryData = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], curr) => {
      const convertedAmount = convertAmount(curr.amount, curr.currency || 'USD', defaultCurr);
      const existing = acc.find(i => i.name === curr.category);
      if (existing) {
        existing.value += convertedAmount;
      } else {
        acc.push({ name: curr.category, value: convertedAmount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  // Monthly trend data (last 6 months, converted)
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const monthTrans = transactions.filter(t => {
       const td = new Date(t.date);
       return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    const exp = monthTrans
      .filter(t => t.type === 'expense')
      .reduce((a, c) => a + convertAmount(c.amount, c.currency || 'USD', defaultCurr), 0);
    trendData.push({ name: monthName, expense: Math.round(exp) });
  }

  const COLORS = ['#C9A66B', '#DBC9B0', '#7C5A3A', '#A88A58', '#E5D8C5', '#8C7051'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-script text-beige-800">Financial Overview</h2>
          <p className="text-beige-600 text-sm">Welcome back. Amounts shown in {defaultCurr}.</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button 
            onClick={() => onAddTransaction('income')}
            className="flex items-center px-4 py-2 bg-white border border-beige-200 rounded-lg text-green-700 shadow-sm hover:bg-green-50 transition-colors"
          >
            <Plus size={16} className="mr-1" /> Income
          </button>
          <button 
            onClick={() => onAddTransaction('expense')}
            className="flex items-center px-4 py-2 bg-beige-700 text-white rounded-lg shadow-md hover:bg-beige-800 transition-colors"
          >
            <Plus size={16} className="mr-1" /> Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-beige-500 uppercase tracking-wide">Income</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalIncome, defaultCurr)}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-beige-500 uppercase tracking-wide">Expenses</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalExpense, defaultCurr)}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
            <ArrowDownRight size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-beige-500 uppercase tracking-wide">Balance</p>
            <h3 className="text-2xl font-bold text-beige-800 mt-1">{formatCurrency(balance, defaultCurr)}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-beige-100 flex items-center justify-center text-beige-600 relative z-10">
            <Wallet size={20} />
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <Wallet size={100} color="#C9A66B" />
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-beige-800">Monthly Budget</h3>
            <span className="text-sm font-medium text-beige-600">{Math.round(budgetProgress)}% Used</span>
        </div>
        <div className="w-full bg-beige-100 rounded-full h-3 overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${budgetProgress > 100 ? 'bg-red-500' : 'bg-beige-500'}`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            ></div>
        </div>
        <p className="text-xs text-beige-400 mt-2 text-right">
            {formatCurrency(totalExpense, defaultCurr)} / {formatCurrency(settings.monthlyBudget, defaultCurr)}
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100">
            <h3 className="text-lg font-semibold text-beige-800 mb-4">Spending Trend (6 Months)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C9A66B" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#C9A66B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#7C5A3A' }}
                            formatter={(value: number) => [formatCurrency(value, defaultCurr), 'Expense']}
                        />
                        <Area type="monotone" dataKey="expense" stroke="#C9A66B" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-100">
            <h3 className="text-lg font-semibold text-beige-800 mb-4">Expenses by Category</h3>
            <div className="h-64 flex items-center justify-center">
                {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#7C5A3A' }}
                                formatter={(value: number) => [formatCurrency(value, defaultCurr), 'Amount']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-beige-400">No expenses this month</p>
                )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {categoryData.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center text-xs text-beige-600">
                        <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        {entry.name}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;