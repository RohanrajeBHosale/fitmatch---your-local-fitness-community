
import React, { useState } from 'react';
import { X, Save, Check, Star } from 'lucide-react';
import { User, ActivityType, FitnessGoal } from '../types';
import { ACTIVITIES, ACTIVITY_ICONS, SKILL_LEVELS, FITNESS_GOALS, GOAL_ICONS } from '../constants';
import { storageService } from '../services/storage';

interface ProfileEditModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [aboutMe, setAboutMe] = useState(user.aboutMe || '');
  const [skillLevel, setSkillLevel] = useState(user.skillLevel);
  const [activities, setActivities] = useState<ActivityType[]>(user.activities);
  const [goals, setGoals] = useState<FitnessGoal[]>(user.goals || []);
  const [isSaving, setIsSaving] = useState(false);

  const toggleActivity = (act: ActivityType) => {
    setActivities(prev => 
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  const toggleGoal = (goal: FitnessGoal) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    const updatedUser = { ...user, name, bio, aboutMe, skillLevel, activities, goals };
    
    // Simulate minor delay for UX
    setTimeout(() => {
      storageService.updateUser(updatedUser);
      onUpdate(updatedUser);
      setIsSaving(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-[40px] flex flex-col max-h-[90vh] animate-slide-up shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-[40px]">
          <h2 className="text-xl font-black text-slate-900">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">One-line Bio</label>
            <input 
              type="text" 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-medium text-slate-600 outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">About Me</label>
            <textarea 
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-medium text-slate-600 outline-none focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Skill Level</label>
            <div className="grid grid-cols-2 gap-2">
              {SKILL_LEVELS.map(level => (
                <button 
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`py-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    skillLevel === level 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <Star className={`w-3 h-3 ${skillLevel === level ? 'fill-current' : ''}`} />
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fitness Goals</label>
            <div className="grid grid-cols-2 gap-3">
              {FITNESS_GOALS.map(goal => {
                const Icon = GOAL_ICONS[goal];
                const active = goals.includes(goal);
                return (
                  <button 
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all flex items-center gap-3 ${
                      active 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-500' : ''}`} />
                    {goal}
                    {active && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">My Activities</label>
            <div className="grid grid-cols-2 gap-3">
              {ACTIVITIES.map(act => {
                const Icon = ACTIVITY_ICONS[act];
                const active = activities.includes(act);
                return (
                  <button 
                    key={act}
                    onClick={() => toggleActivity(act)}
                    className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all flex items-center gap-3 ${
                      active 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-500' : ''}`} />
                    {act}
                    {active && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-emerald-500 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
