-- Drop duplicate tables and functions
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP FUNCTION IF EXISTS create_conversation_from_match(UUID, UUID);
DROP FUNCTION IF EXISTS create_conversation_on_match();
DROP FUNCTION IF EXISTS handle_potential_match(UUID, UUID);

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a UUID NOT NULL REFERENCES auth.users(id),
    user_b UUID NOT NULL REFERENCES auth.users(id),
    business_a UUID NOT NULL REFERENCES business_profiles(id),
    business_b UUID NOT NULL REFERENCES business_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_are_different CHECK (user_a <> user_b),
    CONSTRAINT businesses_are_different CHECK (business_a <> business_b)
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX conversations_user_a_idx ON conversations(user_a);
CREATE INDEX conversations_user_b_idx ON conversations(user_b);
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX messages_created_at_idx ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (auth.uid() IN (user_a, user_b));

CREATE POLICY "Users can insert conversations they are part of"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IN (user_a, user_b));

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND auth.uid() IN (c.user_a, c.user_b)
        )
    );

CREATE POLICY "Users can insert messages in their conversations"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND auth.uid() IN (c.user_a, c.user_b)
        )
    );

-- Function to check for match and create conversation
CREATE OR REPLACE FUNCTION handle_potential_match(
    swiper_uid UUID,
    target_business_id UUID
) RETURNS TABLE (
    is_match BOOLEAN,
    conversation_id UUID,
    matched_business_id UUID,
    matched_user_id UUID
) AS $$
DECLARE
    target_owner_uid UUID;
    swiper_business_id UUID;
    existing_conversation UUID;
    v_debug_info JSONB;
    matching_swipe_timestamp TIMESTAMPTZ;
BEGIN
    -- Get the owner of the target business
    SELECT owner_uid INTO target_owner_uid
    FROM business_profiles
    WHERE id = target_business_id;

    -- Get the business profile of the swiper
    SELECT id INTO swiper_business_id
    FROM business_profiles
    WHERE owner_uid = swiper_uid;

    -- Store debug info
    v_debug_info := jsonb_build_object(
        'swiper_uid', swiper_uid,
        'target_owner_uid', target_owner_uid,
        'swiper_business_id', swiper_business_id,
        'target_business_id', target_business_id
    );
    
    RAISE NOTICE 'Debug info: %', v_debug_info;

    -- Check if there's already a right swipe from the target and get its timestamp
    SELECT created_at INTO matching_swipe_timestamp
    FROM swipes s
    WHERE s.swiper_uid = target_owner_uid
    AND s.target_business_id = swiper_business_id
    AND s.direction = 'right';

    IF matching_swipe_timestamp IS NOT NULL THEN
        -- It's a match! Check if conversation already exists
        SELECT c.id INTO existing_conversation
        FROM conversations c
        WHERE (
            (c.user_a = swiper_uid AND c.user_b = target_owner_uid AND 
             c.business_a = swiper_business_id AND c.business_b = target_business_id)
            OR 
            (c.user_a = target_owner_uid AND c.user_b = swiper_uid AND
             c.business_a = target_business_id AND c.business_b = swiper_business_id)
        );

        RAISE NOTICE 'Existing conversation: %', existing_conversation;

        IF existing_conversation IS NULL THEN
            -- Determine who swiped first to set as user_a
            IF matching_swipe_timestamp < NOW() THEN
                -- Target swiped first
                INSERT INTO conversations (user_a, user_b, business_a, business_b)
                VALUES (target_owner_uid, swiper_uid, target_business_id, swiper_business_id)
                RETURNING id INTO existing_conversation;
            ELSE
                -- Current user swiped first
                INSERT INTO conversations (user_a, user_b, business_a, business_b)
                VALUES (swiper_uid, target_owner_uid, swiper_business_id, target_business_id)
                RETURNING id INTO existing_conversation;
            END IF;

            RAISE NOTICE 'Created new conversation: %', existing_conversation;

            -- Create match entries for both businesses
            INSERT INTO matches (user_a, user_b, business_a, business_b, matched_at)
            VALUES 
                (target_owner_uid, swiper_uid, target_business_id, swiper_business_id, NOW()),
                (swiper_uid, target_owner_uid, swiper_business_id, target_business_id, NOW());
        END IF;

        RETURN QUERY
        SELECT 
            TRUE as is_match,
            existing_conversation as conversation_id,
            target_business_id as matched_business_id,
            target_owner_uid as matched_user_id;
    ELSE
        RETURN QUERY
        SELECT 
            FALSE as is_match,
            NULL::UUID as conversation_id,
            NULL::UUID as matched_business_id,
            NULL::UUID as matched_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to debug match handling
CREATE OR REPLACE FUNCTION debug_match_flow(
    swiper_uid UUID,
    target_business_id UUID
) RETURNS TABLE (
    step_name TEXT,
    details JSONB
) AS $$
DECLARE
    target_owner_uid UUID;
    swiper_business_id UUID;
    existing_conversation UUID;
BEGIN
    -- Step 1: Get target business owner
    SELECT owner_uid INTO target_owner_uid
    FROM business_profiles
    WHERE id = target_business_id;
    
    RETURN QUERY SELECT 
        'step1_target_owner'::TEXT, 
        jsonb_build_object(
            'target_business_id', target_business_id,
            'target_owner_uid', target_owner_uid
        );

    -- Step 2: Get swiper's business
    SELECT id INTO swiper_business_id
    FROM business_profiles
    WHERE owner_uid = swiper_uid;
    
    RETURN QUERY SELECT 
        'step2_swiper_business'::TEXT, 
        jsonb_build_object(
            'swiper_uid', swiper_uid,
            'swiper_business_id', swiper_business_id
        );

    -- Step 3: Check for existing right swipe
    RETURN QUERY SELECT 
        'step3_check_swipes'::TEXT,
        jsonb_build_object(
            'exists', EXISTS (
                SELECT 1
                FROM swipes s
                WHERE s.swiper_uid = target_owner_uid
                AND s.target_business_id = swiper_business_id
                AND s.direction = 'right'
            ),
            'found_swipes', (
                SELECT jsonb_agg(jsonb_build_object(
                    'swiper_uid', s.swiper_uid,
                    'target_business_id', s.target_business_id,
                    'direction', s.direction,
                    'created_at', s.created_at
                ))
                FROM swipes s
                WHERE (s.swiper_uid = target_owner_uid AND s.target_business_id = swiper_business_id)
                   OR (s.swiper_uid = swiper_uid AND s.target_business_id = target_business_id)
            )
        );

    -- Step 4: Check for existing conversation
    SELECT c.id INTO existing_conversation
    FROM conversations c
    WHERE (
        (c.user_a = swiper_uid AND c.user_b = target_owner_uid AND 
         c.business_a = swiper_business_id AND c.business_b = target_business_id)
        OR 
        (c.user_a = target_owner_uid AND c.user_b = swiper_uid AND
         c.business_a = target_business_id AND c.business_b = swiper_business_id)
    );
    
    RETURN QUERY SELECT 
        'step4_check_conversation'::TEXT,
        jsonb_build_object(
            'existing_conversation_id', existing_conversation,
            'all_user_conversations', (
                SELECT jsonb_agg(jsonb_build_object(
                    'id', c.id,
                    'user_a', c.user_a,
                    'user_b', c.user_b,
                    'business_a', c.business_a,
                    'business_b', c.business_b,
                    'created_at', c.created_at
                ))
                FROM conversations c
                WHERE c.user_a IN (swiper_uid, target_owner_uid)
                   OR c.user_b IN (swiper_uid, target_owner_uid)
            )
        );

    -- Step 5: Test conversation creation
    RETURN QUERY SELECT 
        'step5_test_insert'::TEXT,
        jsonb_build_object(
            'can_insert', EXISTS (
                SELECT 1
                FROM business_profiles bp1, business_profiles bp2
                WHERE bp1.owner_uid = swiper_uid 
                AND bp2.owner_uid = target_owner_uid
            ),
            'swiper_business_exists', EXISTS (
                SELECT 1 FROM business_profiles WHERE owner_uid = swiper_uid
            ),
            'target_business_exists', EXISTS (
                SELECT 1 FROM business_profiles WHERE id = target_business_id
            )
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages; 