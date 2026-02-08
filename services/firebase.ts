
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, get, child } from "firebase/database";
import { User, Match, ChatMessage } from "../types";

// HACKATHON NOTE: Paste your Firebase config here to enable true cross-device sync!
// If left as null, the app will gracefully fallback to Local Storage.
const firebaseConfig = null; 

let app: any = null;
let db: any = null;

if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
}

export const isFirebaseEnabled = !!db;

export const firebaseService = {
  // Sync User Data
  async syncUser(user: User) {
    if (!db) return;
    await set(ref(db, `users/${user.id}`), user);
  },

  async getUser(userId: string): Promise<User | null> {
    if (!db) return null;
    const snapshot = await get(ref(db, `users/${userId}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  listenToUsers(callback: (users: User[]) => void) {
    if (!db) return () => {};
    return onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.values(data));
      }
    });
  },

  // Sync Matches
  async sendMatchRequest(userId: string, match: Match) {
    if (!db) return;
    await set(ref(db, `matches/${userId}/${match.id}`), match);
    // Also push to recipient's node
    const recipientMatch = { ...match, id: `inbound_${match.id}` };
    await set(ref(db, `matches/${match.receiverId}/${recipientMatch.id}`), recipientMatch);
  },

  listenToMatches(userId: string, callback: (matches: Match[]) => void) {
    if (!db) return () => {};
    return onValue(ref(db, `matches/${userId}`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.values(data));
      } else {
        callback([]);
      }
    });
  },

  async updateMatchStatus(userId: string, matchId: string, status: string, otherUserId: string) {
    if (!db) return;
    await set(ref(db, `matches/${userId}/${matchId}/status`), status);
    // Find the corresponding match in the other user's node
    const otherSnapshot = await get(ref(db, `matches/${otherUserId}`));
    if (otherSnapshot.exists()) {
      const otherMatches = otherSnapshot.val();
      const counterpart = Object.entries(otherMatches).find(([key, m]: [string, any]) => m.senderId === otherUserId || m.receiverId === otherUserId);
      if (counterpart) {
        await set(ref(db, `matches/${otherUserId}/${counterpart[0]}/status`), status);
      }
    }
  },

  // Sync Chats
  listenToChat(chatId: string, callback: (messages: ChatMessage[]) => void) {
    if (!db) return () => {};
    return onValue(ref(db, `chats/${chatId}`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.values(data));
      } else {
        callback([]);
      }
    });
  },

  async sendMessage(chatId: string, message: ChatMessage) {
    if (!db) return;
    const chatRef = ref(db, `chats/${chatId}`);
    const newMessageRef = push(chatRef);
    await set(newMessageRef, message);
  }
};
