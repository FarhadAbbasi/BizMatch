-- First check if columns exist and add only if they don't
DO $$ 
BEGIN
    -- Add new columns only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'description') THEN
        ALTER TABLE business_profiles ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'founded_date') THEN
        ALTER TABLE business_profiles ADD COLUMN founded_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'company_size') THEN
        ALTER TABLE business_profiles ADD COLUMN company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'website_url') THEN
        ALTER TABLE business_profiles ADD COLUMN website_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'banner_image_url') THEN
        ALTER TABLE business_profiles ADD COLUMN banner_image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'headquarters') THEN
        ALTER TABLE business_profiles ADD COLUMN headquarters TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'funding_stage') THEN
        ALTER TABLE business_profiles ADD COLUMN funding_stage TEXT CHECK (funding_stage IN ('Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Public', 'Bootstrapped'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'revenue_range') THEN
        ALTER TABLE business_profiles ADD COLUMN revenue_range TEXT CHECK (revenue_range IN ('< $100K', '$100K-$1M', '$1M-$10M', '$10M-$50M', '$50M+'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'tech_stack') THEN
        ALTER TABLE business_profiles ADD COLUMN tech_stack TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'looking_for') THEN
        ALTER TABLE business_profiles ADD COLUMN looking_for TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'highlights') THEN
        ALTER TABLE business_profiles ADD COLUMN highlights JSONB DEFAULT '[]';
    END IF;

END $$;

-- Update or create the search vector update function
CREATE OR REPLACE FUNCTION business_profiles_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.services, '{}'::text[]), ' ')), 'C') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, '{}'::text[]), ' ')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (commented out to avoid duplicates)

INSERT INTO business_profiles (
  name, description, industry, location, services, tags,
  logo_url, founded_date, company_size, website_url,
  banner_image_url, headquarters, funding_stage, revenue_range,
  tech_stack, looking_for, highlights
) VALUES (
  'TechCorp Solutions',
  'TechCorp is revolutionizing enterprise software with AI-powered solutions that help businesses scale efficiently.',
  'Software Development',
  'San Francisco, CA',
  ARRAY['Custom Software', 'AI Solutions', 'Cloud Migration'],
  ARRAY['AI', 'Enterprise', 'Cloud'],
  'https://example.com/logo.png',
  '2020-01-15',
  '51-200',
  'https://techcorp.example.com',
  'https://example.com/banner.png',
  'San Francisco, CA',
  'Series A',
  '$1M-$10M',
  ARRAY['React Native', 'Node.js', 'PostgreSQL', 'AWS'],
  ARRAY['Strategic Partners', 'Enterprise Clients', 'Senior Engineers'],
  '[
    {"title": "Recent Achievement", "content": "Named Top 10 AI Startups 2023"},
    {"title": "Growth", "content": "300% YoY Revenue Growth"},
    {"title": "Impact", "content": "Helping 100+ enterprises scale"}
  ]'::jsonb
);
