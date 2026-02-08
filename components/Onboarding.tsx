
import React, { useState } from 'react';
import { User, ActivityType, FitnessGoal } from '../types';
import { ACTIVITIES, DAYS_OF_WEEK, TIME_WINDOWS, ACTIVITY_ICONS, SKILL_LEVELS, FITNESS_GOALS, GOAL_ICONS } from '../constants';
import { Dumbbell, ArrowRight, Check, Calendar, Clock, Star, Heart, User as UserIcon } from 'lucide-react';
import { storageService } from '../services/storage';

interface OnboardingProps {
  currentUser: User;
  onComplete: (user: User) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ currentUser, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<FitnessGoal[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedWindows, setSelectedWindows] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<User['skillLevel']>('Beginner');

  const toggleActivity = (act: ActivityType) => {
    setSelectedActivities(prev => 
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  const toggleGoal = (goal: FitnessGoal) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleWindow = (window: string) => {
    setSelectedWindows(prev => 
      prev.includes(window) ? prev.filter(w => w !== window) : [...prev, window]
    );
  };

  const handleFinish = () => {
    const updatedUser: User = {
      ...currentUser,
      name: name || 'Athlete',
      bio: bio || 'Ready to crush some goals!',
      aboutMe: aboutMe || 'I am passionate about health and fitness.',
      goals: selectedGoals,
      activities: selectedActivities,
      availability: [...selectedDays, ...selectedWindows],
      skillLevel: skillLevel,
      isProfileComplete: true
    };
    storageService.updateUser(updatedUser);
    onComplete(updatedUser);
  };

  return (
    <div className="fixed inset-0 bg-white z-[150] flex flex-col max-w-md mx-auto">
      <div className="flex-1 px-8 py-12 flex flex-col justify-center overflow-y-auto hide-scrollbar">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-500 w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-8">
              <Dumbbell className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight">Welcome to<br/><span className="text-emerald-500">FitMatch.</span></h1>
            <p className="text-slate-500 font-medium">Find your local fitness tribe. First, what should we call you?</p>
            <input 
              type="text" 
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:border-emerald-500 transition-all"
            />
            <button 
              disabled={!name}
              onClick={() => setStep(2)}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:bg-slate-800"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">What do you<br/>enjoy doing?</h2>
            <p className="text-slate-500 font-medium">Select activities you're looking for partners for.</p>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
              {ACTIVITIES.map(act => {
                const Icon = ACTIVITY_ICONS[act];
                return (
                  <button 
                    key={act}
                    onClick={() => toggleActivity(act)}
                    className={`p-4 rounded-3xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-3 ${
                      selectedActivities.includes(act) 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${selectedActivities.includes(act) ? 'bg-emerald-500 text-white' : 'bg-slate-200/50 text-slate-400'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {act}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 text-slate-400 font-bold py-4">Back</button>
              <button 
                disabled={selectedActivities.length === 0}
                onClick={() => setStep(3)}
                className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">What are your<br/>fitness goals?</h2>
            <p className="text-slate-500 font-medium">We'll match you with people with similar motivations.</p>
            <div className="grid grid-cols-2 gap-3">
              {FITNESS_GOALS.map(goal => {
                const Icon = GOAL_ICONS[goal];
                return (
                  <button 
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-3xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-3 ${
                      selectedGoals.includes(goal) 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${selectedGoals.includes(goal) ? 'bg-emerald-500 text-white' : 'bg-slate-200/50 text-slate-400'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {goal}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(2)} className="flex-1 text-slate-400 font-bold py-4">Back</button>
              <button 
                disabled={selectedGoals.length === 0}
                onClick={() => setStep(4)}
                className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">What's your<br/>skill level?</h2>
            <p className="text-slate-500 font-medium">This helps us match you with buddies who train at your pace.</p>
            
            <div className="space-y-3">
              {SKILL_LEVELS.map(level => (
                <button 
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`w-full p-5 rounded-3xl border-2 font-bold text-left transition-all flex items-center justify-between ${
                    skillLevel === level 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${skillLevel === level ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Star className={`w-5 h-5 ${skillLevel === level ? 'fill-current' : ''}`} />
                    </div>
                    <span>{level}</span>
                  </div>
                  {skillLevel === level && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(3)} className="flex-1 text-slate-400 font-bold py-4">Back</button>
              <button 
                onClick={() => setStep(5)}
                className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">Your Weekly<br/>Schedule</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <Calendar className="w-4 h-4" /> Days Available
              </div>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button 
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black border-2 transition-all ${
                      selectedDays.includes(day)
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <Clock className="w-4 h-4" /> Preferred Windows
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1 hide-scrollbar">
                {TIME_WINDOWS.map(window => (
                  <button 
                    key={window}
                    onClick={() => toggleWindow(window)}
                    className={`px-5 py-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-between ${
                      selectedWindows.includes(window)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {window}
                    {selectedWindows.includes(window) && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(4)} className="flex-1 text-slate-400 font-bold py-4">Back</button>
              <button 
                disabled={selectedDays.length === 0 && selectedWindows.length === 0}
                onClick={() => setStep(6)}
                className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">Tell us about<br/>yourself.</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Short Bio (One line)</label>
                <input 
                  type="text"
                  placeholder="E.g. Training for a marathon!"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">About Me (Deep dive)</label>
                <textarea 
                  placeholder="Tell potential buddies about your fitness journey, what you're looking for, or any funny gym stories..."
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 h-40 text-sm font-medium outline-none focus:border-emerald-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(5)} className="flex-1 text-slate-400 font-bold py-4">Back</button>
              <button 
                onClick={handleFinish}
                className="flex-[2] bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
