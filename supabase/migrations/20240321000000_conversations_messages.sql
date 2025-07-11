-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_a_id UUID NOT NULL REFERENCES business_profiles(id),
    business_b_id UUID NOT NULL REFERENCES business_profiles(id),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_businesses CHECK (business_a_id != business_b_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES business_profiles(id),
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'file')) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX conversations_business_a_id_idx ON conversations(business_a_id);
CREATE INDEX conversations_business_b_id_idx ON conversations(business_b_id);
CREATE INDEX conversations_last_message_at_idx ON conversations(last_message_at DESC);
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX messages_created_at_idx ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (
        business_a_id IN (
            SELECT id FROM business_profiles WHERE owner_uid = auth.uid()
        ) OR 
        business_b_id IN (
            SELECT id FROM business_profiles WHERE owner_uid = auth.uid()
        )
    );

CREATE POLICY "Users can insert conversations if they're part of it"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (
        business_a_id IN (
            SELECT id FROM business_profiles WHERE owner_uid = auth.uid()
        ) OR 
        business_b_id IN (
            SELECT id FROM business_profiles WHERE owner_uid = auth.uid()
        )
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    TO authenticated
    USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE 
                business_a_id IN (SELECT id FROM business_profiles WHERE owner_uid = auth.uid())
                OR 
                business_b_id IN (SELECT id FROM business_profiles WHERE owner_uid = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their conversations"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id IN (
            SELECT id FROM business_profiles WHERE owner_uid = auth.uid()
        ) AND
        conversation_id IN (
            SELECT id FROM conversations
            WHERE 
                business_a_id IN (SELECT id FROM business_profiles WHERE owner_uid = auth.uid())
                OR 
                business_b_id IN (SELECT id FROM business_profiles WHERE owner_uid = auth.uid())
        )
    );

-- Create function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation last_message_at
CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message_timestamp();

-- Create view for easier conversation querying with last message
CREATE VIEW conversation_details AS
SELECT 
    c.id as conversation_id,
    c.business_a_id,
    c.business_b_id,
    c.created_at as conversation_created_at,
    c.last_message_at,
    bp_a.name as business_a_name,
    bp_a.logo_url as business_a_logo,
    bp_a.industry as business_a_industry,
    bp_b.name as business_b_name,
    bp_b.logo_url as business_b_logo,
    bp_b.industry as business_b_industry,
    lm.content as last_message_content,
    lm.sender_id as last_message_sender_id,
    lm.created_at as last_message_created_at
FROM conversations c
LEFT JOIN business_profiles bp_a ON c.business_a_id = bp_a.id
LEFT JOIN business_profiles bp_b ON c.business_b_id = bp_b.id
LEFT JOIN LATERAL (
    SELECT content, sender_id, created_at
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
) lm ON true;

-- Create function to create conversation from match
CREATE OR REPLACE FUNCTION create_conversation_from_match(business_a_id UUID, business_b_id UUID)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    -- Check if conversation already exists
    SELECT id INTO conversation_id
    FROM conversations
    WHERE (business_a_id = $1 AND business_b_id = $2)
       OR (business_a_id = $2 AND business_b_id = $1);
    
    -- If no conversation exists, create one
    IF conversation_id IS NULL THEN
        INSERT INTO conversations (business_a_id, business_b_id)
        VALUES ($1, $2)
        RETURNING id INTO conversation_id;
    END IF;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql; 