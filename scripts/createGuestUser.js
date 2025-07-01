// Script to create a guest user in the users table
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Guest user ID - must match the one used in the app
const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';

async function createGuestUser() {
  try {
    console.log('Checking if guest user already exists...');
    
    // Check if guest user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', GUEST_USER_ID)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for guest user:', checkError);
      return;
    }
    
    if (existingUser) {
      console.log('Guest user already exists:', existingUser);
      return;
    }
    
    console.log('Creating guest user...');
    
    // Create guest user in the users table
    const now = new Date().toISOString();
    
    const { data: guestUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: GUEST_USER_ID,
        email: 'guest@ratepal.app',
        name: 'Guest User',
        avatar_url: null,
        is_premium: false,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating guest user:', JSON.stringify(insertError, null, 2));
      
      // Check for specific error types
      if (insertError.code === '23505') {
        console.log('\nA user with this ID already exists but might not be visible in the interface.');
      } else if (insertError.code === '42501') {
        console.log('\nPermission denied. You might need to update RLS policies for the users table.');
        console.log('Go to the Supabase dashboard > Authentication > Policies');
        console.log('Add a policy for the users table that allows service role to insert records.');
      }
      
      return;
    }
    
    console.log('Guest user created successfully:', guestUser);
    console.log('You can now create lists as a guest user!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createGuestUser();
