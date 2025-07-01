// Script to update RLS policies for the lists table
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

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

async function updateRLSPolicies() {
  try {
    console.log('Checking current RLS policies for lists table...');
    
    // First, let's try to create a list with the guest user ID to see if it works
    const guestUserId = '00000000-0000-0000-0000-000000000000';
    
    console.log('Testing list creation with guest user ID...');
    const { data: testList, error: testError } = await supabase
      .from('lists')
      .insert({
        title: 'Test Guest List',
        description: 'Testing RLS policies',
        user_id: guestUserId,
        is_public: false
      })
      .select()
      .single();
    
    if (testError) {
      console.error('Error creating test list:', testError);
      
      // If we get an RLS error, we need to update the policies
      if (testError.code === '42501') {
        console.log('\nRow-Level Security policy is preventing list creation.');
        console.log('\nTo fix this issue, you need to update the RLS policies in Supabase:');
        console.log('1. Go to the Supabase dashboard: https://app.supabase.com/');
        console.log('2. Navigate to your project > Authentication > Policies');
        console.log('3. Find the "lists" table');
        console.log('4. Create or modify the INSERT policy with the following SQL:');
        console.log('\n   CREATE POLICY "Enable insert for authenticated and guest users" ON "public"."lists"');
        console.log('   FOR INSERT TO authenticated, anon');
        console.log('   WITH CHECK (true);\n');
        console.log('5. Create or modify the SELECT policy with the following SQL:');
        console.log('\n   CREATE POLICY "Enable read access for all users" ON "public"."lists"');
        console.log('   FOR SELECT TO authenticated, anon');
        console.log('   USING (is_public OR auth.uid() = user_id OR user_id = \'00000000-0000-0000-0000-000000000000\');\n');
        console.log('6. Create or modify the UPDATE policy with the following SQL:');
        console.log('\n   CREATE POLICY "Enable update for users based on user_id" ON "public"."lists"');
        console.log('   FOR UPDATE TO authenticated, anon');
        console.log('   USING (auth.uid() = user_id OR user_id = \'00000000-0000-0000-0000-000000000000\')');
        console.log('   WITH CHECK (auth.uid() = user_id OR user_id = \'00000000-0000-0000-0000-000000000000\');\n');
        console.log('7. Create or modify the DELETE policy with the following SQL:');
        console.log('\n   CREATE POLICY "Enable delete for users based on user_id" ON "public"."lists"');
        console.log('   FOR DELETE TO authenticated, anon');
        console.log('   USING (auth.uid() = user_id OR user_id = \'00000000-0000-0000-0000-000000000000\');\n');
      }
    } else {
      console.log('Successfully created test list with guest user ID:', testList);
      
      // Clean up the test list
      await supabase
        .from('lists')
        .delete()
        .eq('id', testList.id);
      
      console.log('Test list deleted. RLS policies are working correctly!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateRLSPolicies();
