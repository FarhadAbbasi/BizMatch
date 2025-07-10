import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface SessionState {
  user: User | null;
  setUser: (user: User | null) => void;
  reset: () => void;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  reset: () => set({ user: null }),
})); 