
import React, { useMemo } from 'react';
import { Home, Map, MessageSquare, User, Dumbbell, Zap } from 'lucide-react';
import { storageService } from '../services/storage';
import { isFirebaseEnabled } from '../services/firebase';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const me = storageService.getSessionUser();
  const pendingCount = useMemo(() => {
    if (!me) return 0;
    return storageService.getMatches(me.id).filter(m => m.status === 'pending' && m.receiverId === me.id).length;
  }, [me, activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-slate-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg shadow-sm">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">FitMatch</h1>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isFirebaseEnabled ? 'bg-emerald-500 animate-pulse-soft' : 'bg-amber-400'}`}></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              {isFirebaseEnabled ? 'Realtime Sync Active' : 'Local Storage Mode'}
            </span>
          </div>
        </div>
        <button className="relative">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
             <img src={me?.avatar || "https://picsum.photos/seed/me/100"} alt="Me" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-24 px-4 pt-4">
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-4 flex justify-between items-center z-50">
        <NavButton 
          icon={<Home className="w-6 h-6" />} 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => onTabChange('home')} 
        />
        <NavButton 
          icon={<Map className="w-6 h-6" />} 
          label="Explore" 
          active={activeTab === 'map'} 
          onClick={() => onTabChange('map')} 
        />
        <NavButton 
          icon={
            <div className="relative">
              <MessageSquare className="w-6 h-6" />
              {pendingCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {pendingCount}
                </div>
              )}
            </div>
          } 
          label="Chats" 
          active={activeTab === 'chats'} 
          onClick={() => onTabChange('chats')} 
        />
        <NavButton 
          icon={<User className="w-6 h-6" />} 
          label="Profile" 
          active={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default Layout;
