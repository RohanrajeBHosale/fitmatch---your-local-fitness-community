
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import ExploreMap from './components/ExploreMap';
import UserProfileView from './components/UserProfileView';
import ChatView from './components/ChatView';
import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import ProfileEditModal from './components/ProfileEditModal';
import { User, ActivityType, Match } from './types';
import { DUMMY_USERS, ACTIVITIES, ACTIVITY_ICONS } from './constants';
import { storageService } from './services/storage';
import { firebaseService, isFirebaseEnabled } from './services/firebase';
import { Filter, Zap, MessageSquare, Check, X as CloseIcon, UserPlus, Heart, Sparkles, ChevronRight, Settings, Edit3, Users, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chattingWith, setChattingWith] = useState<User | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | 'All'>('All');
  const [matches, setMatches] = useState<Match[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [cloudUsers, setCloudUsers] = useState<User[]>([]);

  // Local Init
  useEffect(() => {
    const sessionUser = storageService.getSessionUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      setMatches(storageService.getMatches(sessionUser.id));
    }
    setIsInitializing(false);
  }, []);

  // Firebase Realtime Listeners
  useEffect(() => {
    if (!isFirebaseEnabled || !currentUser) return;

    // Listen to Match Updates (New requests, acceptances)
    const unsubscribeMatches = firebaseService.listenToMatches(currentUser.id, (updatedMatches) => {
      setMatches(updatedMatches);
      // Sync to local storage for persistence
      localStorage.setItem(`fitmatch_matches_${currentUser.id}`, JSON.stringify(updatedMatches));
    });

    // Listen to Global User Registry
    const unsubscribeUsers = firebaseService.listenToUsers((users) => {
      setCloudUsers(users);
    });

    return () => {
      unsubscribeMatches();
      unsubscribeUsers();
    };
  }, [currentUser]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setMatches(storageService.getMatches(user.id));
  };

  const handleConnect = async (user: User) => {
    if (!currentUser) return;
    await storageService.sendRequest(currentUser.id, user);
    setMatches(storageService.getMatches(currentUser.id));
    setSelectedUser(null);
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'decline') => {
    if (!currentUser) return;
    await storageService.respondToRequest(currentUser.id, requestId, action);
    setMatches(storageService.getMatches(currentUser.id));
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setMatches([]);
    setActiveTab('home');
  };

  const handleResetDemo = () => {
    if (window.confirm("This will clear all local data and reset the app. Continue?")) {
      storageService.clearAll();
    }
  };

  const pendingRequests = useMemo(() => 
    matches.filter(m => m.status === 'pending' && m.receiverId === currentUser?.id),
    [matches, currentUser]
  );

  const activeMatches = useMemo(() => 
    matches.filter(m => m.status === 'accepted'),
    [matches]
  );

  // Merge dummy users with cloud users, removing duplicates
  const displayUsers = useMemo(() => {
    const userMap = new Map();
    DUMMY_USERS.forEach(u => userMap.set(u.id, u));
    cloudUsers.forEach(u => {
      if (u.id !== currentUser?.id) userMap.set(u.id, u);
    });
    const users = Array.from(userMap.values());
    return selectedActivity === 'All' 
      ? users 
      : users.filter(u => u.activities.includes(selectedActivity as ActivityType));
  }, [cloudUsers, selectedActivity, currentUser]);

  if (isInitializing) return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!currentUser) return <Auth onAuthSuccess={handleAuthSuccess} />;
  if (!currentUser.isProfileComplete) return <Onboarding currentUser={currentUser} onComplete={setCurrentUser} />;

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24">
          <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="relative z-10">
              <h2 className="text-2xl font-black leading-tight mb-2">Ready to grind,<br/>{currentUser.name.split(' ')[0]}?</h2>
              <p className="text-slate-400 text-xs font-medium max-w-[180px]">We've found {displayUsers.length} potential buddies for you.</p>
              <button 
                onClick={() => setActiveTab('map')}
                className="mt-5 bg-emerald-500 text-white text-[10px] font-black px-6 py-3 rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current" />
                Open Match Map
              </button>
            </div>
            <div className="absolute -top-10 -right-10 h-64 w-64 opacity-20 bg-emerald-500 blur-[80px] rounded-full"></div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Filter Activities</h3>
                <Filter className="w-3.5 h-3.5 text-slate-300" />
             </div>
             <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                <button 
                  onClick={() => setSelectedActivity('All')}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 ${selectedActivity === 'All' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  All
                </button>
                {ACTIVITIES.map(activity => {
                  const Icon = ACTIVITY_ICONS[activity];
                  return (
                    <button 
                      key={activity}
                      onClick={() => setSelectedActivity(activity)}
                      className={`px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 flex items-center gap-2 ${selectedActivity === activity ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {activity}
                    </button>
                  );
                })}
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Local Athletes</h3>
             <div className="grid grid-cols-1 gap-4">
                {displayUsers.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm font-medium">No athletes found in this category.</div>
                ) : displayUsers.map(user => (
                  <div 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="group bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer flex items-center gap-4 active:scale-[0.98]"
                  >
                    <div className="relative">
                      <img src={user.avatar} className="w-20 h-20 rounded-[24px] object-cover shadow-inner" alt="" />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg border-2 border-white">
                        <Sparkles className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-slate-900 text-lg truncate leading-tight">{user.name}, {user.age}</h4>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{user.distance}km</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold mb-3 italic">"{user.bio.substring(0, 45)}..."</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {user.activities.slice(0, 2).map(a => {
                          const Icon = ACTIVITY_ICONS[a];
                          return (
                            <span key={a} className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                              {Icon && <Icon className="w-2.5 h-2.5" />}
                              {a}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && <ExploreMap onSelectUser={setSelectedUser} />}

      {activeTab === 'chats' && (
        <div className="flex flex-col gap-8 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* Friend Requests Section */}
           {pendingRequests.length > 0 && (
             <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <UserPlus className="w-4 h-4 text-emerald-500" />
                     Incoming Requests ({pendingRequests.length})
                   </h3>
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 px-1">
                   {pendingRequests.map(req => (
                     <div key={req.id} className="flex-shrink-0 w-40 bg-white rounded-[32px] border border-slate-100 p-4 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center group">
                        <div className="relative mb-3">
                          <img src={req.buddy.avatar} className="w-16 h-16 rounded-[24px] object-cover border-2 border-emerald-50 shadow-md group-hover:scale-110 transition-transform" alt="" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mb-1 truncate w-full">{req.buddy.name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-4 tracking-wider">{req.buddy.activities[0]}</p>
                        <div className="flex gap-2 w-full">
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleRespond(req.id, 'accept'); }}
                             className="flex-1 bg-emerald-500 text-white py-2 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-90"
                           >
                              <Check className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleRespond(req.id, 'decline'); }}
                             className="flex-1 bg-slate-100 text-slate-400 py-2 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90"
                           >
                              <CloseIcon className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* Squad / Friends Group Section */}
           {activeMatches.length > 0 && (
             <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Users className="w-4 h-4 text-emerald-500" />
                     My Squad
                   </h3>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex -space-x-3 mb-4">
                      {activeMatches.slice(0, 5).map(match => (
                        <img key={match.id} src={match.buddy.avatar} className="w-10 h-10 rounded-full border-2 border-slate-800 object-cover shadow-lg" alt="" />
                      ))}
                      {activeMatches.length > 5 && (
                        <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] text-white font-black">
                          +{activeMatches.length - 5}
                        </div>
                      )}
                    </div>
                    <h4 className="text-white font-black text-lg mb-1">Squad Group View</h4>
                    <p className="text-slate-400 text-xs font-medium">Coordinate a group workout with all your active buddies.</p>
                    <button className="mt-5 bg-emerald-500 text-white text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                      Start Group Thread
                    </button>
                  </div>
                  <Users className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5" />
                </div>
             </div>
           )}

           <div className="space-y-5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                Active Buddies
              </h3>
              {activeMatches.length === 0 ? (
                <div className="bg-white rounded-[40px] py-16 px-8 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                  <div className="bg-slate-50 p-6 rounded-full mb-6">
                    <Heart className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-slate-900 font-black text-lg mb-2">No buddies yet?</h4>
                  <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-[200px]">Swipe through potential partners and start your fitness journey!</p>
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="mt-8 bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                  >
                    Start Matching
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-[40px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                   {activeMatches.map(match => (
                     <button 
                       key={match.id} 
                       onClick={() => setChattingWith(match.buddy)}
                       className="w-full flex items-center gap-4 p-6 hover:bg-slate-50/50 transition-all group"
                     >
                       <div className="relative">
                         <img src={match.buddy.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                       </div>
                       <div className="flex-1 text-left min-w-0">
                         <div className="flex justify-between items-center mb-0.5">
                           <h4 className="font-black text-slate-900">{match.buddy.name}</h4>
                           <span className="text-[9px] font-black text-emerald-500 uppercase">Connected</span>
                         </div>
                         <p className="text-xs text-slate-400 font-medium truncate">Tap to message your training buddy!</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                     </button>
                   ))}
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="flex flex-col gap-6 pb-24 animate-in fade-in duration-500">
           <div className="flex flex-col items-center text-center pt-8">
              <div className="relative mb-6">
                 <img src={currentUser.avatar} className="w-32 h-32 rounded-[40px] object-cover border-4 border-white shadow-2xl" alt="" />
                 <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                    <Zap className="w-5 h-5 fill-current" />
                 </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{currentUser.name}, {currentUser.age}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{currentUser.skillLevel} Athlete</span>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-4 px-2">
             <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Skills & Activities</h3>
                   <div className="flex flex-wrap gap-2">
                     {currentUser.activities.map(a => {
                       const Icon = ACTIVITY_ICONS[a];
                       return (
                         <div key={a} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600">
                           {Icon && <Icon className="w-4 h-4 text-emerald-500" />}
                           {a}
                         </div>
                       );
                     })}
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Account Settings</h3>
                   <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full flex items-center justify-between group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-500 transition-colors">
                         <Edit3 className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                       </div>
                       <span className="text-sm font-bold text-slate-700">Account Details</span>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-300" />
                   </button>
                   
                   <button className="w-full flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                       <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-slate-900 transition-colors">
                         <Settings className="w-4 h-4 text-slate-400 group-hover:text-white" />
                       </div>
                       <span className="text-sm font-bold text-slate-700">Notifications</span>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-300" />
                   </button>

                   <button 
                    onClick={handleResetDemo}
                    className="w-full flex items-center justify-between group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="bg-amber-50 p-2 rounded-lg group-hover:bg-amber-500 transition-colors">
                         <RefreshCcw className="w-4 h-4 text-amber-500 group-hover:text-white" />
                       </div>
                       <span className="text-sm font-bold text-slate-700">Reset Demo State</span>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-300" />
                   </button>

                   <div className="h-px bg-slate-50 w-full my-2"></div>
                   
                   <button 
                    onClick={handleLogout}
                    className="w-full text-left py-2 text-sm font-black text-rose-500 hover:text-rose-600 transition-colors flex items-center justify-between"
                   >
                     Sign Out
                     <CloseIcon className="w-4 h-4" />
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}

      {isEditingProfile && currentUser && (
        <ProfileEditModal 
          user={currentUser} 
          onClose={() => setIsEditingProfile(false)}
          onUpdate={setCurrentUser}
        />
      )}

      {selectedUser && (
        <UserProfileView 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onStartChat={handleConnect}
        />
      )}

      {chattingWith && (
        <ChatView 
          buddy={chattingWith} 
          onBack={() => setChattingWith(null)} 
        />
      )}
    </Layout>
  );
};

export default App;
