-- Create business_profiles table
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_uid UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    location TEXT NOT NULL,
    services TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    linkedin_url TEXT,
    logo_url TEXT,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create swipes table
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swiper_uid UUID NOT NULL REFERENCES auth.users(id),
    target_business_id UUID NOT NULL REFERENCES business_profiles(id),
    direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create matches view for easier querying
CREATE VIEW matches AS
SELECT 
    a.swiper_uid as user_a,
    b.swiper_uid as user_b,
    a.target_business_id as business_a,
    b.target_business_id as business_b,
    GREATEST(a.created_at, b.created_at) as matched_at
FROM swipes a
JOIN swipes b ON 
    a.swiper_uid = b.target_business_id AND
    b.swiper_uid = a.target_business_id AND
    a.direction = 'right' AND
    b.direction = 'right';

-- Create indexes
CREATE INDEX business_profiles_owner_uid_idx ON business_profiles(owner_uid);
CREATE INDEX business_profiles_tags_gin_idx ON business_profiles USING GIN(tags);
CREATE INDEX swipes_swiper_uid_idx ON swipes(swiper_uid);
CREATE INDEX swipes_target_business_id_idx ON swipes(target_business_id);

-- Enable Row Level Security
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_profiles
CREATE POLICY "Users can view all business profiles"
    ON business_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own business profile"
    ON business_profiles FOR INSERT
    TO authenticated
    WITH CHECK (owner_uid = auth.uid());

CREATE POLICY "Users can update their own business profile"
    ON business_profiles FOR UPDATE
    TO authenticated
    USING (owner_uid = auth.uid())
    WITH CHECK (owner_uid = auth.uid());

CREATE POLICY "Users can delete their own business profile"
    ON business_profiles FOR DELETE
    TO authenticated
    USING (owner_uid = auth.uid());

-- RLS Policies for swipes
CREATE POLICY "Users can view their own swipes"
    ON swipes FOR SELECT
    TO authenticated
    USING (swiper_uid = auth.uid());

CREATE POLICY "Users can insert their own swipes"
    ON swipes FOR INSERT
    TO authenticated
    WITH CHECK (swiper_uid = auth.uid());

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(business_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE business_profiles
    SET view_count = view_count + 1
    WHERE id = business_id;
END;
$$ LANGUAGE plpgsql; 