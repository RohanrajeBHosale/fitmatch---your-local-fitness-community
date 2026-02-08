
import React, { useState, useEffect } from 'react';
import { User as UserIcon, MapPin, Search, LocateFixed, Loader2, Navigation, ExternalLink, Dumbbell } from 'lucide-react';
import { User } from '../types';
import { DUMMY_USERS } from '../constants';
import { geminiService } from '../services/gemini';

interface ExploreMapProps {
  onSelectUser: (user: User) => void;
}

const ExploreMap: React.FC<ExploreMapProps> = ({ onSelectUser }) => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [searchResult, setSearchResult] = useState<{ text: string, links: { title: string, uri: string }[] } | null>(null);
  const [currentPos, setCurrentPos] = useState({ top: '50%', left: '50%', lat: 40.785, lng: -73.968 });

  const requestPreciseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPos(prev => ({ ...prev, lat: latitude, lng: longitude, top: '48%', left: '52%' }));
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const searchNearbyGyms = async () => {
    setIsSearchingPlaces(true);
    const result = await geminiService.searchNearbyPlaces("gyms and public sports courts", currentPos.lat, currentPos.lng);
    setSearchResult(result);
    setIsSearchingPlaces(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full animate-in fade-in duration-500 pb-20">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search areas or sports..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm"
          />
        </div>
        <button 
          onClick={requestPreciseLocation}
          disabled={isLocating}
          title="Improve Location Accuracy"
          className={`px-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm transition-all active:scale-95 ${isLocating ? 'text-emerald-500' : 'text-slate-500 hover:text-emerald-500 hover:border-emerald-100'}`}
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LocateFixed className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="relative w-full aspect-[4/5] bg-slate-100 rounded-[32px] overflow-hidden shadow-inner border border-slate-200">
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute top-1/2 left-0 w-full h-4 bg-slate-300 -rotate-12"></div>
          <div className="absolute top-0 left-1/3 w-4 h-full bg-slate-300 rotate-6"></div>
          <div className="absolute top-1/4 left-0 w-full h-4 bg-slate-300 rotate-45"></div>
        </div>

        {/* User Markers */}
        {DUMMY_USERS.map((user) => (
          <button
            key={user.id}
            onClick={() => setActiveUser(user)}
            className={`absolute transition-all duration-500 transform hover:scale-125 z-20`}
            style={{ 
              top: `${(user.location.lat - 40.775) * 4000}%`, 
              left: `${(user.location.lng + 73.98) * 2000}%` 
            }}
          >
            <div className={`flex flex-col items-center group`}>
              <div className={`p-1 rounded-full shadow-lg border-2 transition-all ${activeUser?.id === user.id ? 'bg-emerald-500 border-white scale-125' : 'bg-white border-emerald-500'}`}>
                <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt={user.name} />
              </div>
              <div className={`mt-1 px-2 py-0.5 rounded-lg bg-slate-900/90 backdrop-blur-sm text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                {user.name}
              </div>
            </div>
          </button>
        ))}

        {/* User Current Location Marker */}
        <div 
          className="absolute transition-all duration-1000 ease-out z-10" 
          style={{ top: currentPos.top, left: currentPos.left, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <div className={`absolute -inset-6 bg-blue-500/10 rounded-full ${isLocating ? 'animate-pulse' : 'animate-ping'}`}></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg relative z-10"></div>
          </div>
        </div>

        {/* Floating Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
           <button 
             onClick={searchNearbyGyms}
             disabled={isSearchingPlaces}
             className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 text-slate-700 hover:text-emerald-500 transition-colors flex items-center justify-center disabled:opacity-50"
           >
             {isSearchingPlaces ? <Loader2 className="w-5 h-5 animate-spin" /> : <Dumbbell className="w-5 h-5" />}
           </button>
        </div>

        {/* Selected User Preview Card */}
        {activeUser && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-slide-up z-50">
            <div className="flex items-center gap-4">
              <img src={activeUser.avatar} className="w-16 h-16 rounded-2xl object-cover" alt={activeUser.name} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-slate-900 truncate">{activeUser.name}, {activeUser.age}</h3>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">{activeUser.distance}km</span>
                </div>
                <div className="flex gap-1 mt-2 overflow-x-auto hide-scrollbar">
                  {activeUser.activities.map(a => (
                    <span key={a} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-black uppercase">{a}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button 
                onClick={() => onSelectUser(activeUser)}
                className="flex-1 bg-emerald-500 text-white font-black py-3 rounded-2xl text-xs hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                View Profile
              </button>
              <button 
                onClick={() => setActiveUser(null)}
                className="px-6 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Search Results Drawer */}
        {searchResult && !activeUser && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-slide-up z-50">
            <div className="flex items-center justify-between mb-3">
               <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                 <Navigation className="w-3.5 h-3.5" /> Nearby Training Grounds
               </h4>
               <button onClick={() => setSearchResult(null)} className="text-slate-300 hover:text-slate-600 transition-colors">
                  <Loader2 className="w-4 h-4 rotate-45" />
               </button>
            </div>
            <p className="text-xs text-slate-600 font-medium mb-4 line-clamp-2">{searchResult.text}</p>
            <div className="space-y-2 max-h-[160px] overflow-y-auto hide-scrollbar">
              {searchResult.links.map((link, i) => (
                <a 
                  key={i} 
                  href={link.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all group"
                >
                   <span className="text-xs font-bold text-slate-700 truncate pr-4">{link.title}</span>
                   <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
          Popular Hotspots
        </h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {['Central Park', 'Gold\'s Gym', 'Skyline Tracks', 'Riverfront Courts', 'Pelham Bay'].map((loc) => (
            <button key={loc} className="flex-shrink-0 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">
              {loc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreMap;
