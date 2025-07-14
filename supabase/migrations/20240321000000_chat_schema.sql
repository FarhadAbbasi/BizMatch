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

-- Function to create a conversation when a match occurs
CREATE OR REPLACE FUNCTION create_conversation_on_match()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO conversations (user_a, user_b, business_a, business_b)
    VALUES (NEW.user_a, NEW.user_b, NEW.business_a, NEW.business_b);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create conversation on match
DROP TRIGGER IF EXISTS create_conversation_on_match_trigger ON matches;
CREATE TRIGGER create_conversation_on_match_trigger
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION create_conversation_on_match();

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages; 