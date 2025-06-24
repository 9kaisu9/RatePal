// RatePal Database Schema in DBML format
// For direct import into dbdiagram.io

// Enable UUID extension
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

Table users {
  id uuid [pk, default: `uuid_generate_v4()`]
  email text [unique, not null]
  password_hash text [not null]
  name text
  avatar_url text
  is_premium boolean [default: false]
  created_at timestamptz [default: `NOW()`]
  updated_at timestamptz [default: `NOW()`]
}

Table lists {
  id uuid [pk, default: `uuid_generate_v4()`]
  user_id uuid [ref: > users.id, not null]
  title text [not null]
  description text
  is_public boolean [default: false]
  created_at timestamptz [default: `NOW()`]
  updated_at timestamptz [default: `NOW()`]
  last_entry_at timestamptz
  entry_count integer [default: 0]
}

Table field_types {
  id serial [pk]
  name text [not null]
  description text
}

Table custom_fields {
  id uuid [pk, default: `uuid_generate_v4()`]
  list_id uuid [ref: > lists.id, not null]
  name text [not null]
  field_type_id integer [ref: > field_types.id]
  is_required boolean [default: false]
  options jsonb
  position integer [not null]
  created_at timestamptz [default: `NOW()`]
  
  indexes {
    (list_id, name) [unique]
  }
}

Table entries {
  id uuid [pk, default: `uuid_generate_v4()`]
  list_id uuid [ref: > lists.id, not null]
  user_id uuid [ref: > users.id, not null]
  title text [not null]
  description text
  rating numeric
  created_at timestamptz [default: `NOW()`]
  updated_at timestamptz [default: `NOW()`]
}

Table field_values {
  id uuid [pk, default: `uuid_generate_v4()`]
  entry_id uuid [ref: > entries.id, not null]
  field_id uuid [ref: > custom_fields.id, not null]
  value_text text
  value_number numeric
  value_date timestamptz
  value_boolean boolean
  value_json jsonb
  
  indexes {
    (entry_id, field_id) [unique]
  }
}

Table rating_systems {
  id serial [pk]
  name text [not null]
  min_value numeric [not null]
  max_value numeric [not null]
  step_value numeric [default: 1]
  display_type text [not null]
  tier_labels text[]
}

Table list_rating_settings {
  list_id uuid [pk, ref: - lists.id]
  rating_system_id integer [ref: > rating_systems.id]
  is_required boolean [default: true]
  display_position integer [default: 0]
}

Table voice_memos {
  entry_id uuid [pk, ref: - entries.id]
  audio_url text [not null]
  transcription_text text
  ai_summary text
  processing_status text [not null]
  duration_seconds integer
  created_at timestamptz [default: `NOW()`]
}

// Indexes
// CREATE INDEX idx_lists_user_id ON lists(user_id);
// CREATE INDEX idx_custom_fields_list_id ON custom_fields(list_id);
// CREATE INDEX idx_entries_list_id ON entries(list_id);
// CREATE INDEX idx_entries_user_id ON entries(user_id);
// CREATE INDEX idx_field_values_entry_id ON field_values(entry_id);
// CREATE INDEX idx_voice_memos_entry_id ON voice_memos(entry_id);
