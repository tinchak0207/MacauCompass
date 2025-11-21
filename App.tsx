import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ConsoleLayout from './components/ConsoleLayout';
import Dashboard from './components/Dashboard';
import CostAnalysis from './components/CostAnalysis';
import PolicyAdvisor from './components/PolicyAdvisor';
import GlassCard from './components/GlassCard';
import IndustryChart from './components/charts/IndustryChart';
import TrademarkChart from './components/charts/TrademarkChart';
import { NavView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<NavView>(NavView.LANDING);

  // Simple Hash Routing simulation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'console') {
        setView(NavView.DASHBOARD);
      } else if (hash === '') {
        setView(NavView.LANDING);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    if (window.location.hash === '#console') {
        setView(NavView.DASHBOARD);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const enterConsole = () => {
    window.location.hash = 'console';
    setView(NavView.DASHBOARD);
  };

  const exitConsole = () => {
    window.location.hash = '';
    setView(NavView.LANDING);
  };

  // Render content based on current view state
  const renderContent = () => {
    switch (view) {
      case NavView.DASHBOARD:
        return <Dashboard />;
      case NavView.COSTS:
        return <CostAnalysis />;
      case NavView.AI_ADVISOR:
        return <PolicyAdvisor />;
      case NavView.INDUSTRY:
        return (
          <div className="space-y-4">
             <h2 className="text-2xl font-serif font-bold text-white">行業深度分析</h2>
             <GlassCard className="p-8 h-[600px] flex flex-col">
               <IndustryChart />
             </GlassCard>
          </div>
        );
      case NavView.TRADEMARKS:
        return (
           <div className="space-y-4">
             <h2 className="text-2xl font-serif font-bold text-white">商標申請趨勢</h2>
             <GlassCard className="p-8 h-[600px] flex flex-col">
               <TrademarkChart />
             </GlassCard>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (view === NavView.LANDING) {
    return <LandingPage onEnter={enterConsole} />;
  }

  return (
    <ConsoleLayout activeView={view} onChangeView={setView} onLogout={exitConsole}>
      {renderContent()}
    </ConsoleLayout>
  );
};

export default App;