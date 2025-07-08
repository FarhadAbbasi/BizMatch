import { create } from 'zustand';
import { Session, Provider } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface SessionState {
  session: Session | null;
  loading: boolean;
  init: () => () => void;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useSession = create<SessionState>((set) => ({
  session: null,
  loading: true,
  init: () => {
    // Set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session: session || null });
      set({ loading: false });
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });

    // Return cleanup function
    return () => subscription.unsubscribe();
  },
  signInWithProvider: async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'bizmatch://auth/callback',
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
})); 