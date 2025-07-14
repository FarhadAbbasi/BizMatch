import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

interface SwipeRequest {
  business_id: string;
  direction: 'left' | 'right';
}

interface MatchResult {
  is_match: boolean;
  conversation_id: string | null;
  matched_business_id: string | null;
  matched_user_id: string | null;
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Use environment variables without fallbacks in production
      Deno.env.get('URL')!,
      Deno.env.get('ANON_KEY')!,
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
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          details: userError?.message || 'No user session found'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    if (!body || !body.business_id || !body.direction || !['left', 'right'].includes(body.direction)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: 'Required fields: business_id (string) and direction ("left" | "right")'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { business_id, direction }: SwipeRequest = body;

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
      // Call our match handling function
      const { data: matchResult, error: matchError } = await supabaseClient
        .rpc('handle_potential_match', {
          swiper_uid: user.id,
          target_business_id: business_id,
        })
        .single();

      if (matchError) {
        throw matchError;
      }

      const result = matchResult as MatchResult;

      if (result.is_match) {
        // Get the matched business details
        const { data: matchedBusiness, error: businessError } = await supabaseClient
          .from('business_profiles')
          .select('*')
          .eq('id', result.matched_business_id)
          .single();

        if (businessError) {
          throw businessError;
        }

        return new Response(
          JSON.stringify({
            match: true,
            matchBusiness: matchedBusiness,
            conversationId: result.conversation_id,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create_like function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error.code || 'UNKNOWN'
      }),
      {
        status: error.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 