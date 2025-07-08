import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

interface SwipeRequest {
  business_id: string;
  direction: 'left' | 'right';
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://nazwjoeruujlkqvduqzn.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hendqb2VydXVqbGtxdmR1cXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjU4NTAsImV4cCI6MjA2MDY0MTg1MH0.fZDxWJRvbU3Qwl0mXAqMVTmvU62kLTujQQi3FIVVt8Y',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the request body
    const { business_id, direction }: SwipeRequest = await req.json();

    // Insert the swipe
    const { error: swipeError } = await supabaseClient
      .from('swipes')
      .insert({
        swiper_uid: user.id,
        target_business_id: business_id,
        direction,
      });

    if (swipeError) {
      throw swipeError;
    }

    // If it's a right swipe, check for a match
    if (direction === 'right') {
      // Check if there's a reciprocal right swipe
      const { data: matchData, error: matchError } = await supabaseClient
        .from('swipes')
        .select('*, business_profiles(*)')
        .eq('swiper_uid', business_id)
        .eq('target_business_id', user.id)
        .eq('direction', 'right')
        .single();

      if (matchError) {
        throw matchError;
      }

      // If there's a match, return the matched business profile
      if (matchData) {
        return new Response(
          JSON.stringify({
            match: true,
            matchBusiness: matchData.business_profiles,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // No match found
    return new Response(
      JSON.stringify({
        match: false,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}); 