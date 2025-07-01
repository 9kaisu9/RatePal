-- SQL script to create a guest user in the users table
-- Run this in the Supabase SQL Editor

-- Create the guest user with UUID 00000000-0000-0000-0000-000000000000
INSERT INTO public.users (
  id, 
  email, 
  name, 
  avatar_url, 
  is_premium, 
  created_at, 
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'guest@ratepal.app',
  'Guest User',
  NULL,
  FALSE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT * FROM public.users WHERE id = '00000000-0000-0000-0000-000000000000';

-- Create RLS policy for lists table to allow guest users to create lists
CREATE POLICY "Enable insert for authenticated and guest users" 
ON public.lists
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Create RLS policy for lists table to allow reading lists
CREATE POLICY "Enable read access for all users" 
ON public.lists
FOR SELECT 
TO authenticated, anon
USING (is_public OR auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- Create RLS policy for lists table to allow updating lists
CREATE POLICY "Enable update for users based on user_id" 
ON public.lists
FOR UPDATE 
TO authenticated, anon
USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000')
WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- Create RLS policy for lists table to allow deleting lists
CREATE POLICY "Enable delete for users based on user_id" 
ON public.lists
FOR DELETE 
TO authenticated, anon
USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- Create RLS policy for custom_fields table to allow creating custom fields
CREATE POLICY "Enable insert for authenticated and guest users" 
ON public.custom_fields
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Create RLS policy for custom_fields table to allow reading custom fields
CREATE POLICY "Enable read access for all users" 
ON public.custom_fields
FOR SELECT 
TO authenticated, anon
USING (true);

-- Create RLS policy for custom_fields table to allow updating custom fields
CREATE POLICY "Enable update for all users" 
ON public.custom_fields
FOR UPDATE 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Create RLS policy for custom_fields table to allow deleting custom fields
CREATE POLICY "Enable delete for all users" 
ON public.custom_fields
FOR DELETE 
TO authenticated, anon
USING (true);
