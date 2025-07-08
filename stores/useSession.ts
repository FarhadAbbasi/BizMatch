import { create } from 'zustand';
import { produce } from 'immer';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface SessionState {
  user: User | null;
  hasCompletedOnboarding: boolean;
  linkedInToken: string | null;
  linkedInRefreshToken: string | null;
  linkedInExpiresAt: number | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setOnboardingComplete: (completed: boolean) => void;
  setLinkedInTokens: (tokens: { 
    access_token: string; 
    refresh_token: string; 
    expires_at: number; 
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  hasCompletedOnboarding: false,
  linkedInToken: null,
  linkedInRefreshToken: null,
  linkedInExpiresAt: null,
  isLoading: true,
  error: null,

  setUser: (user) => set(produce((state) => {
    state.user = user;
  })),

  setOnboardingComplete: (completed) => set(produce((state) => {
    state.hasCompletedOnboarding = completed;
  })),

  setLinkedInTokens: (tokens) => set(produce((state) => {
    state.linkedInToken = tokens.access_token;
    state.linkedInRefreshToken = tokens.refresh_token;
    state.linkedInExpiresAt = tokens.expires_at;
  })),

  setLoading: (loading) => set(produce((state) => {
    state.isLoading = loading;
  })),

  setError: (error) => set(produce((state) => {
    state.error = error;
  })),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set(produce((state) => {
        state.user = null;
        state.linkedInToken = null;
        state.linkedInRefreshToken = null;
        state.linkedInExpiresAt = null;
        state.hasCompletedOnboarding = false;
      }));
    } catch (error) {
      set(produce((state) => {
        state.error = 'Failed to sign out';
      }));
    }
  },
})); 