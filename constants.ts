
import { User, ActivityType, FitnessGoal } from './types';
import { 
  Dumbbell, 
  Footprints, 
  Trophy, 
  Target, 
  Wind, 
  Bike, 
  Mountain,
  Flame,
  Zap,
  Heart,
  Users,
  Timer,
  BicepsFlexed
} from 'lucide-react';

export const ACTIVITIES: ActivityType[] = ['Gym', 'Running', 'Basketball', 'Tennis', 'Yoga', 'Cycling', 'Hiking'];

export const ACTIVITY_ICONS: Record<ActivityType, any> = {
  'Gym': Dumbbell,
  'Running': Footprints,
  'Basketball': Trophy,
  'Tennis': Target,
  'Yoga': Wind,
  'Cycling': Bike,
  'Hiking': Mountain,
};

export const FITNESS_GOALS: FitnessGoal[] = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'Socialize', 'Competition'];

export const GOAL_ICONS: Record<FitnessGoal, any> = {
  'Weight Loss': Flame,
  'Muscle Gain': BicepsFlexed,
  'Endurance': Timer,
  'Flexibility': Wind,
  'Socialize': Users,
  'Competition': Trophy,
};

export const SKILL_LEVELS: User['skillLevel'][] = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TIME_WINDOWS = [
  'Early Morning (5am-8am)',
  'Morning (8am-12pm)',
  'Lunch Break (12pm-2pm)',
  'Afternoon (2pm-5pm)',
  'Evening (5pm-9pm)',
  'Night Owl (9pm+)',
  'Weekends Only'
];

export const DUMMY_USERS: User[] = [
  {
    id: '1',
    email: 'sarah.chen@example.com',
    name: 'Sarah Chen',
    age: 27,
    gender: 'Female',
    bio: 'Looking for a morning run partner!',
    aboutMe: 'I am a software engineer who loves the outdoors. I started running during the pandemic and never looked back. I am training for my first marathon and would love a partner for long runs.',
    goals: ['Endurance', 'Competition'],
    avatar: 'https://picsum.photos/seed/sarah/200',
    activities: ['Running', 'Yoga'],
    skillLevel: 'Intermediate',
    distance: 0.8,
    location: { lat: 40.785091, lng: -73.968285 },
    availability: ['Mon', 'Wed', 'Fri', 'Early Morning (5am-8am)'],
    isProfileComplete: true
  },
  {
    id: '2',
    email: 'marcus.j@example.com',
    name: 'Marcus Johnson',
    age: 31,
    gender: 'Male',
    bio: 'Heavy lifting enthusiast. Need a spotter!',
    aboutMe: 'Gym rat for over 10 years. I focus mostly on powerlifting and hypertrophy. I am very disciplined with my routine and looking for someone who takes training seriously.',
    goals: ['Muscle Gain', 'Competition'],
    avatar: 'https://picsum.photos/seed/marcus/200',
    activities: ['Gym'],
    skillLevel: 'Advanced',
    distance: 1.2,
    location: { lat: 40.7812, lng: -73.9665 },
    availability: ['Tue', 'Thu', 'Sat', 'Evening (5pm-9pm)'],
    isProfileComplete: true
  },
  {
    id: '3',
    email: 'alex.r@example.com',
    name: 'Alex Rivera',
    age: 24,
    gender: 'Non-binary',
    bio: 'Looking for casual tennis partners!',
    aboutMe: 'Recent graduate. I used to play tennis in high school and want to get back into it. I am also into hiking and exploring local trails on the weekends.',
    goals: ['Socialize', 'Weight Loss'],
    avatar: 'https://picsum.photos/seed/alex/200',
    activities: ['Tennis', 'Hiking'],
    skillLevel: 'Beginner',
    distance: 2.5,
    location: { lat: 40.7789, lng: -73.9701 },
    availability: ['Sat', 'Sun', 'Weekends Only'],
    isProfileComplete: true
  }
];

export const APP_THEME = {
  primary: 'emerald-500',
  secondary: 'slate-900',
  accent: 'orange-500',
  background: 'slate-50'
};
