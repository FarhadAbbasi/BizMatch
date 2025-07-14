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

    -- Check if there's already a right swipe from the target
    IF EXISTS (
        SELECT 1
        FROM swipes s
        WHERE s.swiper_uid = target_owner_uid
        AND s.target_business_id = swiper_business_id
        AND s.direction = 'right'
    ) THEN
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
            -- Create the conversation with the first user who swiped right as user_a
            INSERT INTO conversations (user_a, user_b, business_a, business_b)
            VALUES (target_owner_uid, swiper_uid, target_business_id, swiper_business_id)
            RETURNING id INTO existing_conversation;

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