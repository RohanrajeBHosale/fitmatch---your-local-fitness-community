
import React, { useEffect, useState, useMemo } from 'react';
import { X, MapPin, Star, Sparkles, Heart, CheckCircle2, Clock, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { geminiService } from '../services/gemini';
import { storageService } from '../services/storage';
import { DAYS_OF_WEEK, ACTIVITY_ICONS, GOAL_ICONS } from '../constants';

interface UserProfileViewProps {
  user: User;
  onClose: () => void;
  onStartChat: (user: User) => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onClose, onStartChat }) => {
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [isLoadingReason, setIsLoadingReason] = useState(true);
  const me = storageService.getSessionUser();

  const matchState = useMemo(() => {
    if (!me) return null;
    return storageService.getMatches(me.id).find(m => m.receiverId === user.id || m.senderId === user.id);
  }, [me, user]);

  const timeWindows = useMemo(() => {
    return user.availability.filter(item => item.length > 3);
  }, [user.availability]);

  useEffect(() => {
    const fetchReason = async () => {
      setIsLoadingReason(true);
      if (me) {
        const reason = await geminiService.getMatchingReason(me, user);
        setAiReason(reason);
      }
      setIsLoadingReason(false);
    };
    fetchReason();
  }, [user, me]);

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-[40px] overflow-hidden max-h-[90vh] flex flex-col animate-slide-up shadow-2xl">
        {/* Header/Image */}
        <div className="relative h-80 shrink-0">
          <img src={user.avatar} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-6 left-8 right-8 text-white">
            <h2 className="text-3xl font-black mb-1 leading-tight">{user.name}, {user.age}</h2>
            <div className="flex items-center gap-2 text-sm font-bold opacity-90 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/20">
              <MapPin className="w-3.5 h-3.5" />
              {user.distance} km away • {user.skillLevel}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 hide-scrollbar">
          {/* AI Reason */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-5 relative overflow-hidden group shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
              <Sparkles className="w-16 h-16 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">FitMatch AI Analysis</span>
            </div>
            {isLoadingReason ? (
              <div className="flex items-center gap-2 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
              </div>
            ) : (
              <p className="text-slate-800 text-sm italic font-semibold leading-relaxed">"{aiReason}"</p>
            )}
          </div>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5" />
              About Me
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {user.aboutMe || user.bio}
            </p>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Fitness Goals</h3>
            <div className="flex flex-wrap gap-2">
              {(user.goals || []).map(goal => {
                const Icon = GOAL_ICONS[goal];
                return (
                  <div key={goal} className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-700 border border-emerald-100 shadow-sm">
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {goal}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-emerald-600">Preferred Schedule</h3>
            <div className="flex gap-2 mb-4">
              {DAYS_OF_WEEK.map(day => {
                const isAvailable = user.availability.includes(day);
                return (
                  <div key={day} className={`flex-1 text-center py-2.5 rounded-xl text-[10px] font-black transition-all ${
                    isAvailable ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 border-slate-900' : 'bg-slate-50 text-slate-300 border-slate-50'
                  } border`}>
                    {day}
                  </div>
                );
              })}
            </div>
            {timeWindows.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {timeWindows.map(window => (
                  <div key={window} className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl text-[10px] font-black text-emerald-600 border border-emerald-100">
                    <Clock className="w-3 h-3" />
                    {window}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.activities.map(a => {
                const Icon = ACTIVITY_ICONS[a];
                return (
                  <div key={a} className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100 shadow-sm">
                    {Icon && <Icon className="w-3 h-3 text-emerald-500" />}
                    {a}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-4 bg-white border-t border-slate-100 flex gap-4 shrink-0">
          <button className="p-5 bg-slate-50 text-slate-400 rounded-[24px] hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90 border border-slate-100">
            <Heart className="w-6 h-6 fill-current" />
          </button>
          
          {matchState?.status === 'pending' ? (
            <button 
              disabled
              className="flex-1 bg-slate-100 text-slate-400 font-black py-5 rounded-[24px] flex items-center justify-center gap-3 border border-slate-200"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Request Sent
            </button>
          ) : matchState?.status === 'accepted' ? (
            <button 
              onClick={() => onStartChat(user)}
              className="flex-1 bg-emerald-500 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] text-sm"
            >
              Message Buddy
            </button>
          ) : (
            <button 
              onClick={() => onStartChat(user)}
              className="flex-1 bg-emerald-500 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] text-sm"
            >
              Send Connect Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
