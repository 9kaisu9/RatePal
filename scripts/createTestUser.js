// Script to create a test user in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This should be the service key, not the anon key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env');
  console.log('Current values:');
  console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓ Set' : '✗ Missing');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'test@example.com')
      .single();
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      console.log('Email: test@example.com');
      console.log('Password: password123');
      return existingUser;
    }
    
    // Create a user with email/password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
      },
    });

    if (authError) {
      throw authError;
    }

    console.log('Auth user created:', authData.user.id);
    
    // Insert user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        is_premium: false,
      })
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    console.log('User profile created:', userData);
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');

    return userData;
  } catch (error) {
    console.error('Error creating test user:', error);
    
    // Check if it's a duplicate user error
    if (error.code === '23505' || (error.message && error.message.includes('already exists'))) {
      console.log('User already exists. Try signing in with:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }
    throw error;
  }
}

createTestUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
