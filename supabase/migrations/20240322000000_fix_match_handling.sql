-- Drop the old trigger since it won't work on a view
DROP TRIGGER IF EXISTS create_conversation_on_match_trigger ON matches;
DROP FUNCTION IF EXISTS create_conversation_on_match();
DROP FUNCTION IF EXISTS handle_potential_match(UUID, UUID);

-- Create the match handling function that also creates conversations
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
    new_conversation_id UUID;
BEGIN
    -- Get the owner of the target business
    SELECT owner_uid INTO target_owner_uid
    FROM business_profiles
    WHERE id = target_business_id;

    -- Get the business profile of the swiper
    SELECT id INTO swiper_business_id
    FROM business_profiles
    WHERE owner_uid = swiper_uid;

    -- Check if there's already a right swipe from the target
    IF EXISTS (
        SELECT 1
        FROM swipes s
        WHERE s.swiper_uid = target_owner_uid
        AND s.target_business_id = swiper_business_id
        AND s.direction = 'right'
    ) THEN
        -- Check for existing conversation
        SELECT c.id INTO existing_conversation
        FROM conversations c
        WHERE (c.user_a = swiper_uid AND c.user_b = target_owner_uid)
        OR (c.user_a = target_owner_uid AND c.user_b = swiper_uid);

        -- Create conversation if it doesn't exist
        IF existing_conversation IS NULL THEN
            INSERT INTO conversations (user_a, user_b, business_a, business_b)
            VALUES (swiper_uid, target_owner_uid, swiper_business_id, target_business_id)
            RETURNING id INTO new_conversation_id;
            
            existing_conversation := new_conversation_id;
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