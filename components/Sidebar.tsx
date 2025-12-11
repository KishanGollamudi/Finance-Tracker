import React from 'react';
import { LayoutDashboard, Receipt, PieChart, Settings, Sparkles } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'reports', label: 'Visualizer', icon: PieChart },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full md:w-64 bg-white/50 backdrop-blur-md border-r border-beige-200 flex flex-col h-full fixed md:relative z-20">
      <div className="p-8">
        <h1 className="font-script text-4xl text-beige-700 text-center drop-shadow-sm">BeigeLedger</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as View)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out group
              ${currentView === item.id 
                ? 'bg-beige-500 text-white shadow-lg shadow-beige-500/30' 
                : 'text-beige-700 hover:bg-beige-100'
              }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'text-white' : 'text-beige-600 group-hover:text-beige-800'} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 text-center">
        <p className="text-xs text-beige-400 font-light">v1.0.0 • Premium Edition</p>
      </div>
    </div>
  );
};

export default Sidebar;