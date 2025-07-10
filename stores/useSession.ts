import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface SessionState {
  user: User | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setOnboardingComplete: (completed: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  initialize: () => Promise<void>;
}

export const useSession = create<SessionState>((set, get) => ({
  user: null,
  isLoading: true,
  hasCompletedOnboarding: false,
  error: null,
  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnboardingComplete: (completed) => set({ hasCompletedOnboarding: completed }),
  setError: (error) => set({ error }),
  reset: () => set({ 
    user: null, 
    isLoading: false, 
    hasCompletedOnboarding: false, 
    error: null 
  }),
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      const currentUser = session?.user ?? null;
      set({ user: currentUser });

      if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('owner_uid', currentUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        set({ hasCompletedOnboarding: !!profile });
      }
    } catch (error: any) {
      console.error('Session initialization error:', error);
      set({ 
        error: error.message || 'Failed to initialize session',
        user: null,
        hasCompletedOnboarding: false
      });
    } finally {
      set({ isLoading: false });
    }
  }
})); 