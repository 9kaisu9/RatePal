import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Initialize Supabase with environment variables
// These will need to be replaced with your actual Supabase URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type definitions for database tables
export type Tables = {
  users: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    is_premium: boolean;
    created_at: string;
    updated_at: string;
  };
  lists: {
    id: string;
    user_id: string | null; // Make user_id nullable for guest users
    title: string;
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    last_entry_at: string | null;
    entry_count: number;
  };
  field_types: {
    id: number;
    name: string;
    description: string;
  };
  custom_fields: {
    id: string;
    list_id: string;
    field_type_id: number;
    name: string;
    options: any | null;
    is_required: boolean;
    position: number;
  };
  entries: {
    id: string;
    list_id: string;
    user_id: string;
    title: string;
    description: string | null;
    rating: number | null;
    created_at: string;
    updated_at: string;
  };
  field_values: {
    id: string;
    entry_id: string;
    field_id: string;
    value_text: string | null;
    value_number: number | null;
    value_date: string | null;
    value_boolean: boolean | null;
    value_json: any | null;
  };
  rating_systems: {
    id: number;
    name: string;
    min_value: number;
    max_value: number;
    step_value: number;
    display_type: string;
    tier_labels: string[] | null;
  };
  list_rating_settings: {
    list_id: string;
    rating_system_id: number;
    is_required: boolean;
    display_position: number;
  };
  voice_memos: {
    entry_id: string;
    audio_url: string;
    transcription_text: string | null;
    ai_summary: string | null;
    processing_status: string;
    duration_seconds: number | null;
    created_at: string;
  };
};
