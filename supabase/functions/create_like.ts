// @ts-nocheck
// Supabase Edge Function: create_like
// Inserts a swipe and returns match info

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore deno std import
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
// deno-lint-ignore no-explicit-any
serve(async (req: Request) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE } = Deno.env.toObject();
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE!, {
      auth: { persistSession: false }
    });

    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    const { data: user, error: authErr } = await supabase.auth.getUser(jwt);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "invalid user" }), { status: 401 });
    }

    const body = await req.json();
    const { target_business_id, direction } = body as {
      target_business_id: string;
      direction: "left" | "right";
    };
    if (!target_business_id || !direction) {
      return new Response(JSON.stringify({ error: "missing fields" }), { status: 400 });
    }

    // Get swipe owner business profile id (first profile for now)
    const { data: myProfile } = await supabase
      .from("business_profiles")
      .select("id")
      .eq("owner_uid", user.user.id)
      .limit(1)
      .single();
    if (!myProfile) {
      return new Response(JSON.stringify({ error: "no_profile" }), { status: 400 });
    }

    // Insert swipe
    await supabase.from("swipes").insert({
      swiper_uid: user.user.id,
      target_business_id,
      direction
    });

    // Only check for match on right swipe
    if (direction === "right") {
      // find owner of target business
      const { data: targetProfile } = await supabase
        .from("business_profiles")
        .select("owner_uid")
        .eq("id", target_business_id)
        .single();
      if (targetProfile) {
        const { data: reciprocal } = await supabase
          .from("swipes")
          .select("id")
          .eq("swiper_uid", targetProfile.owner_uid)
          .eq("target_business_id", myProfile.id)
          .eq("direction", "right")
          .maybeSingle();

        if (reciprocal) {
          // emit realtime event by inserting into a matches table or just return payload
          const { data: matchBusiness } = await supabase
            .from("business_profiles")
            .select("id,name,industry,location,logo_url")
            .eq("id", target_business_id)
            .single();

          return new Response(
            JSON.stringify({ match: true, matchBusiness }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response(JSON.stringify({ match: false }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 });
  }
}); 