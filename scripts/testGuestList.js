// Script to test creating a list with null user_id (guest user)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service key is missing in .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGuestList() {
  try {
    console.log('Testing guest list creation with null user_id...');
    
    // Attempt to create a list with null user_id
    const { data, error } = await supabase
      .from('lists')
      .insert({
        title: 'Test Guest List',
        description: 'Created by a guest user',
        user_id: null,
        is_public: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating guest list:', error);
      
      if (error.code === '23502') { // not-null violation
        console.log('\nThe database schema needs to be updated to allow NULL values for user_id.');
        console.log('\nTo fix this issue:');
        console.log('1. Go to the Supabase dashboard: https://app.supabase.com/');
        console.log('2. Navigate to your project > Database > Tables');
        console.log('3. Find the "lists" table and click on it');
        console.log('4. Click on the "user_id" column');
        console.log('5. Toggle the "Is Nullable" option to ON');
        console.log('6. Click "Save" to update the column');
      }
    } else {
      console.log('Successfully created guest list:', data);
      
      // Clean up the test data
      await supabase
        .from('lists')
        .delete()
        .eq('id', data.id);
      
      console.log('Test list deleted. Guest user support is working correctly!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testGuestList();
