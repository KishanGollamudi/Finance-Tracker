import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { Search, Filter, Trash2, Edit2, Download } from 'lucide-react';
import { getCurrencySymbol } from '../services/currency';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Merchant', 'Payment Method', 'Notes'];
    const rows = filtered.map(t => [
      t.date, 
      t.type, 
      t.amount, 
      t.currency, 
      t.category, 
      t.merchant, 
      t.paymentMethod, 
      `"${t.notes || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "beigeledger_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-beige-100 overflow-hidden">
      <div className="p-6 border-b border-beige-100 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl font-bold text-beige-800">Transactions</h2>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <div className="relative">
             <Search size={16} className="absolute left-3 top-3 text-beige-400" />
             <input
               type="text"
               placeholder="Search merchant..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="pl-9 pr-4 py-2 bg-beige-50 border border-beige-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-beige-400 w-full md:w-48"
             />
          </div>
          
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 bg-beige-50 border border-beige-200 rounded-lg text-sm text-beige-700 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>

          <button 
             onClick={exportCSV}
             className="flex items-center justify-center px-4 py-2 bg-beige-100 text-beige-700 rounded-lg text-sm font-medium hover:bg-beige-200 transition-colors"
          >
            <Download size={16} className="mr-2" /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-beige-50 text-beige-600 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Merchant</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-100">
            {displayed.length > 0 ? (
              displayed.map((t) => (
                <tr key={t.id} className="hover:bg-beige-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{t.merchant}</div>
                    {t.notes && <div className="text-xs text-gray-400 truncate max-w-[150px]">{t.notes}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige-100 text-beige-800">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.paymentMethod}</td>
                  <td className={`px-6 py-4 text-right text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                    {t.type === 'income' ? '+' : '-'}{getCurrencySymbol(t.currency || 'USD')}{t.amount.toLocaleString()}
                    <span className="text-xs text-gray-400 font-normal ml-1">{t.currency}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(t)} className="p-1 text-blue-400 hover:bg-blue-50 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(t.id)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-beige-400 text-sm">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 bg-beige-50 border-t border-beige-100">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded text-sm text-beige-600 hover:bg-beige-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-beige-500">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded text-sm text-beige-600 hover:bg-beige-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;