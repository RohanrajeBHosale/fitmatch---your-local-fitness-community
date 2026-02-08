
export type ActivityType = 'Gym' | 'Running' | 'Basketball' | 'Tennis' | 'Yoga' | 'Cycling' | 'Hiking';
export type FitnessGoal = 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'Flexibility' | 'Socialize' | 'Competition';

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary';
  bio: string;
  aboutMe: string;
  goals: FitnessGoal[];
  avatar: string;
  activities: ActivityType[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  distance: number;
  location: {
    lat: number;
    lng: number;
  };
  availability: string[];
  isProfileComplete: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export type MatchStatus = 'pending' | 'accepted' | 'declined';

export interface Match {
  id: string;
  senderId: string;
  receiverId: string;
  buddy: User; // In storage, we'll store the buddy object for quick display
  status: MatchStatus;
  timestamp: number;
}
