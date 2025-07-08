import { create } from 'zustand';
import { produce } from 'immer';
import { supabase } from '../services/supabase';

export interface BusinessProfile {
  id: string;
  owner_uid: string;
  name: string;
  industry: string;
  location: string;
  services: string[];
  tags: string[];
  linkedin_url: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

interface SwipeState {
  businesses: BusinessProfile[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    industries: string[];
    locations: string[];
    services: string[];
    tags: string[];
  };
  
  // Actions
  setBusinesses: (businesses: BusinessProfile[]) => void;
  setCurrentIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: SwipeState['filters']) => void;
  
  // API Actions
  fetchBusinesses: () => Promise<void>;
  createSwipe: (businessId: string, direction: 'left' | 'right') => Promise<{ match: boolean; matchBusiness?: BusinessProfile }>;
}

export const useSwipe = create<SwipeState>((set, get) => ({
  businesses: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  filters: {
    industries: [],
    locations: [],
    services: [],
    tags: [],
  },

  setBusinesses: (businesses) => set(produce((state) => {
    state.businesses = businesses;
  })),

  setCurrentIndex: (index) => set(produce((state) => {
    state.currentIndex = index;
  })),

  setLoading: (loading) => set(produce((state) => {
    state.isLoading = loading;
  })),

  setError: (error) => set(produce((state) => {
    state.error = error;
  })),

  setFilters: (filters) => set(produce((state) => {
    state.filters = filters;
  })),

  fetchBusinesses: async () => {
    const { setLoading, setError, setBusinesses, filters } = get();
    try {
      setLoading(true);
      let query = supabase
        .from('business_profiles')
        .select('*');

      // Apply filters
      if (filters.industries.length > 0) {
        query = query.in('industry', filters.industries);
      }
      if (filters.locations.length > 0) {
        query = query.in('location', filters.locations);
      }
      if (filters.services.length > 0) {
        query = query.contains('services', filters.services);
      }
      if (filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setBusinesses(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  },

  createSwipe: async (businessId, direction) => {
    const { setError } = get();
    try {
      const { data, error } = await supabase.functions.invoke('create_like', {
        body: { business_id: businessId, direction },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create swipe');
      return { match: false };
    }
  },
})); 