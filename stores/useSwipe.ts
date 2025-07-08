import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { useSession } from './useSession';

export interface BusinessHighlight {
  title: string;
  content: string;
}

export interface BusinessProfile {
  id: string;
  owner_uid: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  services: string[];
  tags: string[];
  linkedin_url?: string;
  logo_url?: string;
  founded_date?: string;
  company_size?: string;
  website_url?: string;
  banner_image_url?: string;
  headquarters?: string;
  funding_stage?: string;
  revenue_range?: string;
  tech_stack: string[];
  looking_for: string[];
  highlights: BusinessHighlight[];
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
  setFilters: (filters: SwipeState['filters']) => void;
  setCurrentIndex: (index: number) => void;
  fetchBusinesses: () => Promise<void>;
  createSwipe: (businessId: string, direction: 'left' | 'right') => Promise<{ match: boolean; matchBusiness: BusinessProfile | null }>;
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
  setFilters: (filters) => set({ filters }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  
  fetchBusinesses: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const session = await supabase.auth.getSession();
      const currentUserId = session.data.session?.user?.id;
      const { filters } = get();
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }
      
      let query = supabase
        .from('business_profiles')
        .select('*')
        .neq('owner_uid', currentUserId); // Don't show user's own business
      
      // Apply filters
      if (filters.industries.length > 0) {
        query = query.in('industry', filters.industries);
      }
      if (filters.locations.length > 0) {
        query = query.in('location', filters.locations);
      }
      if (filters.services.length > 0) {
        query = query.overlaps('services', filters.services);
      }
      if (filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ businesses: data || [] });
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      set({ error: error?.message || 'Failed to fetch businesses' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createSwipe: async (businessId, direction) => {
    try {
      const session = await supabase.auth.getSession();
      const currentUserId = session.data.session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const { data: swipe, error: swipeError } = await supabase
        .from('swipes')
        .insert([
          {
            user_id: currentUserId,
            business_id: businessId,
            direction,
          },
        ])
        .select()
        .single();

      if (swipeError) throw swipeError;

      // If it's a right swipe, check for a match
      if (direction === 'right') {
        const { data: matchBusiness, error: matchError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('id', businessId)
          .single();

        if (matchError) throw matchError;

        // Check if the other business has also swiped right on user's business
        const { data: otherSwipe, error: otherSwipeError } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', matchBusiness.owner_uid)
          .eq('direction', 'right')
          .maybeSingle(); // Use maybeSingle() as there might not be a swipe yet

        if (otherSwipeError) throw otherSwipeError;

        return {
          match: !!otherSwipe, // Match if other business has swiped right
          matchBusiness: otherSwipe ? matchBusiness : null,
        };
      }

      return { match: false, matchBusiness: null };
    } catch (error) {
      console.error('Error creating swipe:', error);
      throw error;
    }
  },
})); 