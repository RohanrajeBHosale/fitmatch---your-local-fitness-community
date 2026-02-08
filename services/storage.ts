
import { User, ChatMessage, Match, MatchStatus } from '../types';
import { DUMMY_USERS } from '../constants';
import { firebaseService, isFirebaseEnabled } from './firebase';

const STORAGE_KEYS = {
  USERS: 'fitmatch_db_users',
  SESSION: 'fitmatch_session_id',
  MATCHES_PREFIX: 'fitmatch_matches_',
  CHATS_PREFIX: 'fitmatch_chats_',
  LIKED_PREFIX: 'fitmatch_liked_'
};

export class StorageService {
  constructor() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DUMMY_USERS));
    }
  }

  private getAllUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  async register(email: string, password: string): Promise<User | null> {
    const users = this.getAllUsers();
    if (users.find(u => u.email === email)) return null;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: '',
      age: 21,
      gender: 'Male',
      bio: '',
      aboutMe: '',
      goals: [],
      avatar: `https://picsum.photos/seed/${email}/200`,
      activities: [],
      skillLevel: 'Beginner',
      distance: 0,
      location: { lat: 40.78, lng: -73.97 },
      availability: [],
      isProfileComplete: false
    };

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, newUser]));
    if (isFirebaseEnabled) await firebaseService.syncUser(newUser);
    
    return newUser;
  }

  async login(email: string): Promise<User | null> {
    // If Firebase is enabled, we try to pull the user from the cloud first
    const users = this.getAllUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Check if this user exists in cloud but not local
    if (!user && isFirebaseEnabled) {
      // For a demo, we'd need a way to find by email in Firebase
      // But we'll assume local is primary or user will register
    }

    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, user.id);
      return user;
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  getSessionUser(): User | null {
    const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionId) return null;
    return this.getAllUsers().find(u => u.id === sessionId) || null;
  }

  async updateUser(user: User): Promise<void> {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      if (isFirebaseEnabled) await firebaseService.syncUser(user);
    }
  }

  getMatches(userId: string): Match[] {
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES_PREFIX + userId);
    return data ? JSON.parse(data) : [];
  }

  async sendRequest(senderId: string, receiver: User): Promise<void> {
    const matches = this.getMatches(senderId);
    if (matches.find(m => m.receiverId === receiver.id)) return;

    const newRequest: Match = {
      id: Math.random().toString(36).substr(2, 9),
      senderId,
      receiverId: receiver.id,
      buddy: receiver,
      status: 'pending',
      timestamp: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEYS.MATCHES_PREFIX + senderId, JSON.stringify([...matches, newRequest]));
    
    const receiverMatches = this.getMatches(receiver.id);
    const me = this.getSessionUser();
    if (me) {
      const incoming: Match = { ...newRequest, buddy: me };
      localStorage.setItem(STORAGE_KEYS.MATCHES_PREFIX + receiver.id, JSON.stringify([...receiverMatches, incoming]));
      
      if (isFirebaseEnabled) {
        await firebaseService.sendMatchRequest(senderId, newRequest);
      }
    }
  }

  async respondToRequest(userId: string, requestId: string, action: 'accept' | 'decline'): Promise<void> {
    const matches = this.getMatches(userId);
    const match = matches.find(m => m.id === requestId);
    if (!match) return;

    const otherUserId = match.senderId === userId ? match.receiverId : match.senderId;

    if (action === 'decline') {
      const filtered = matches.filter(m => m.id !== requestId);
      localStorage.setItem(STORAGE_KEYS.MATCHES_PREFIX + userId, JSON.stringify(filtered));
      
      const senderMatches = this.getMatches(otherUserId);
      const senderFiltered = senderMatches.filter(m => m.receiverId !== userId && m.senderId !== userId);
      localStorage.setItem(STORAGE_KEYS.MATCHES_PREFIX + otherUserId, JSON.stringify(senderFiltered));

      if (isFirebaseEnabled) await firebaseService.updateMatchStatus(userId, requestId, 'declined', otherUserId);
    } else {
      const updated = matches.map(m => m.id === requestId ? { ...m, status: 'accepted' as MatchStatus } : m);
      localStorage.setItem(STORAGE_KEYS.MATCHES_PREFIX + userId, JSON.stringify(updated));

      const senderMatches = this.getMatches(otherUserId);
      const senderUpdated = senderMatches.map(m => (m.senderId === otherUserId && m.receiverId === userId) || (m.senderId === userId && m.receiverId === otherUserId) ? { ...m, status: 'accepted' as MatchStatus } : m);
      localStorage.setItem(STORAGE_KEYS.MATCHES_PREFIX + otherUserId, JSON.stringify(senderUpdated));

      if (isFirebaseEnabled) await firebaseService.updateMatchStatus(userId, requestId, 'accepted', otherUserId);
    }
  }

  getChats(userId: string, buddyId: string): ChatMessage[] {
    const data = localStorage.getItem(`${STORAGE_KEYS.CHATS_PREFIX}${userId}_${buddyId}`);
    return data ? JSON.parse(data) : [];
  }

  async saveChat(userId: string, buddyId: string, message: ChatMessage): Promise<void> {
    const chats = this.getChats(userId, buddyId);
    localStorage.setItem(`${STORAGE_KEYS.CHATS_PREFIX}${userId}_${buddyId}`, JSON.stringify([...chats, message]));
    
    if (isFirebaseEnabled) {
      const chatId = [userId, buddyId].sort().join('_');
      await firebaseService.sendMessage(chatId, message);
    }
  }

  clearAll(): void {
    localStorage.clear();
    window.location.reload();
  }
}

export const storageService = new StorageService();
