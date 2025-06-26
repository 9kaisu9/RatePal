-- RatePal Database Initialization Script
-- For use with Supabase or PostgreSQL

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user accounts
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lists table - Collections of items to rate
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_entry_at TIMESTAMP WITH TIME ZONE,
  entry_count INTEGER DEFAULT 0
);

-- Field types table - Standard field types
CREATE TABLE field_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Custom fields table - User-defined fields for lists
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  field_type_id INTEGER NOT NULL REFERENCES field_types(id),
  name TEXT NOT NULL,
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  UNIQUE(list_id, name)
);

-- Rating systems table - Different rating scales
CREATE TABLE rating_systems (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  min_value NUMERIC NOT NULL,
  max_value NUMERIC NOT NULL,
  step_value NUMERIC DEFAULT 1,
  display_type TEXT NOT NULL,
  tier_labels TEXT[]
);

-- List rating settings - Rating configuration per list
CREATE TABLE list_rating_settings (
  list_id UUID PRIMARY KEY REFERENCES lists(id) ON DELETE CASCADE,
  rating_system_id INTEGER NOT NULL REFERENCES rating_systems(id),
  is_required BOOLEAN DEFAULT true,
  display_position INTEGER DEFAULT 0
);

-- Entries table - Individual rating entries
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rating NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field values - Custom field data for entries
CREATE TABLE field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number NUMERIC,
  value_date TIMESTAMP WITH TIME ZONE,
  value_boolean BOOLEAN,
  value_json JSONB,
  UNIQUE(entry_id, field_id)
);

-- Voice memos - Optional voice recordings for entries
CREATE TABLE voice_memos (
  entry_id UUID PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  transcription_text TEXT,
  ai_summary TEXT,
  processing_status TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_custom_fields_list_id ON custom_fields(list_id);
CREATE INDEX idx_entries_list_id ON entries(list_id);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_field_values_entry_id ON field_values(entry_id);
CREATE INDEX idx_field_values_field_id ON field_values(field_id);

-- Standard field types data
INSERT INTO field_types (name, description) VALUES
  ('Text', 'Free text input'),
  ('Number', 'Numeric values'),
  ('Date', 'Calendar date/time'),
  ('Boolean', 'Yes/No toggle'),
  ('Select', 'Single choice from options'),
  ('MultiSelect', 'Multiple choices from options');

-- Standard rating systems data
INSERT INTO rating_systems (name, min_value, max_value, step_value, display_type, tier_labels) VALUES
  ('Five Stars', 1, 5, 0.5, 'stars', ARRAY['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']),
  ('Percentage', 0, 100, 1, 'percentage', ARRAY['Terrible', 'Poor', 'Average', 'Good', 'Excellent']),
  ('Ten Point Scale', 1, 10, 0.1, 'number', ARRAY['Awful', 'Very Bad', 'Bad', 'Below Average', 'Average', 'Above Average', 'Good', 'Very Good', 'Excellent', 'Perfect']),
  ('Emoji Mood', 1, 5, 1, 'emoji', ARRAY['😡', '🙁', '😐', '🙂', '😄']);

-- Trigger function to update list entry count and last_entry_at
CREATE OR REPLACE FUNCTION update_list_entry_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lists
    SET 
      entry_count = entry_count + 1,
      last_entry_at = NEW.created_at
    WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lists
    SET 
      entry_count = GREATEST(0, entry_count - 1),
      last_entry_at = (
        SELECT MAX(created_at)
        FROM entries
        WHERE list_id = OLD.list_id
          AND id != OLD.id
      )
    WHERE id = OLD.list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update list metrics when entries are added or removed
CREATE TRIGGER entries_update_list_metrics
AFTER INSERT OR DELETE ON entries
FOR EACH ROW
EXECUTE FUNCTION update_list_entry_metrics();

-- Trigger function to update list updated_at when entries change
CREATE OR REPLACE FUNCTION update_list_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lists
  SET updated_at = NOW()
  WHERE id = NEW.list_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update list timestamp when entries are modified
CREATE TRIGGER entries_update_list_timestamp
AFTER INSERT OR UPDATE ON entries
FOR EACH ROW
EXECUTE FUNCTION update_list_timestamp();

-- Function to update timestamps on updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps trigger for users
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Update timestamps trigger for lists
CREATE TRIGGER update_lists_timestamp
BEFORE UPDATE ON lists
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Update timestamps trigger for entries
CREATE TRIGGER update_entries_timestamp
BEFORE UPDATE ON entries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add RLS (Row Level Security) policies for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_memos ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_policy ON users
  FOR ALL
  USING (auth.uid() = id);

-- Lists access policy - owners can do anything, others can only view public lists
CREATE POLICY lists_owner_policy ON lists
  FOR ALL
  USING (auth.uid() = user_id);
  
CREATE POLICY lists_public_policy ON lists
  FOR SELECT
  USING (is_public = true);

-- Custom fields policy - based on list ownership
CREATE POLICY custom_fields_policy ON custom_fields
  FOR ALL
  USING (list_id IN (SELECT id FROM lists WHERE user_id = auth.uid()));
  
CREATE POLICY custom_fields_public_policy ON custom_fields
  FOR SELECT
  USING (list_id IN (SELECT id FROM lists WHERE is_public = true));

-- Entries policy - owners can do anything
CREATE POLICY entries_owner_policy ON entries
  FOR ALL
  USING (user_id = auth.uid());
  
CREATE POLICY entries_list_policy ON entries
  FOR SELECT
  USING (list_id IN (SELECT id FROM lists WHERE is_public = true));

-- Field values policy - based on entry ownership
CREATE POLICY field_values_policy ON field_values
  FOR ALL
  USING (entry_id IN (SELECT id FROM entries WHERE user_id = auth.uid()));
  
CREATE POLICY field_values_public_policy ON field_values
  FOR SELECT
  USING (entry_id IN (SELECT id FROM entries WHERE list_id IN (SELECT id FROM lists WHERE is_public = true)));

-- Voice memos policy - based on entry ownership
CREATE POLICY voice_memos_policy ON voice_memos
  FOR ALL
  USING (entry_id IN (SELECT id FROM entries WHERE user_id = auth.uid()));
  
CREATE POLICY voice_memos_public_policy ON voice_memos
  FOR SELECT
  USING (entry_id IN (SELECT id FROM entries WHERE list_id IN (SELECT id FROM lists WHERE is_public = true)));
