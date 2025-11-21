import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Coins, 
  FileText, 
  Bot, 
  Menu,
  X,
  LogOut,
  Compass
} from 'lucide-react';
import { NavView } from '../types';

interface ConsoleLayoutProps {
  activeView: NavView;
  onChangeView: (view: NavView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const ConsoleLayout: React.FC<ConsoleLayoutProps> = ({ 
  activeView, 
  onChangeView, 
  onLogout, 
  children 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: NavView.DASHBOARD, label: '儀表板', icon: LayoutDashboard },
    { id: NavView.INDUSTRY, label: '行業熱力圖', icon: TrendingUp },
    { id: NavView.COSTS, label: '成本分析', icon: Coins },
    { id: NavView.TRADEMARKS, label: '商標趨勢', icon: FileText },
    { id: NavView.AI_ADVISOR, label: 'AI 政策顧問', icon: Bot },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-black/40 border-r border-white/5 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Compass className="text-emerald-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-white tracking-tight">
              澳門商業指南針
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Entrepreneur Edition</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group
                ${activeView === item.id 
                  ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
              `}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${activeView === item.id ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-colors group"
          >
            <LogOut className="mr-3 h-4 w-4 group-hover:text-red-400 transition-colors" />
            退出系統
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <span className="font-serif text-lg font-bold text-white">Macau Compass</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl md:hidden flex flex-col p-6">
            <div className="flex justify-end mb-8">
               <button onClick={() => setIsMobileMenuOpen(false)}><X className="text-white" /></button>
            </div>
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-4 text-lg font-medium rounded-xl
                    ${activeView === item.id ? 'bg-white/10 text-white' : 'text-gray-400'}
                  `}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.label}
                </button>
              ))}
               <button 
                onClick={onLogout}
                className="w-full flex items-center px-4 py-4 text-lg text-gray-400"
              >
                <LogOut className="mr-4 h-6 w-6" />
                退出
              </button>
            </nav>
          </div>
        )}

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsoleLayout;