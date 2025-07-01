-- SQL script to add RLS policies for entries and field_values tables
-- Run this in the Supabase SQL Editor

-- First, enable RLS on the entries table if not already enabled
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for entries table to allow creating entries
CREATE POLICY "Enable insert for authenticated and guest users"
ON public.entries
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Create RLS policy for entries table to allow reading entries
CREATE POLICY "Enable read access for all users"
ON public.entries
FOR SELECT 
TO authenticated, anon
USING (true);

-- Create RLS policy for entries table to allow updating entries
CREATE POLICY "Enable update for users based on user_id"
ON public.entries
FOR UPDATE 
TO authenticated, anon
USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000')
WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- Create RLS policy for entries table to allow deleting entries
CREATE POLICY "Enable delete for users based on user_id"
ON public.entries
FOR DELETE 
TO authenticated, anon
USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- Now, enable RLS on the field_values table if not already enabled
ALTER TABLE public.field_values ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for field_values table to allow creating field values
CREATE POLICY "Enable insert for authenticated and guest users"
ON public.field_values
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Create RLS policy for field_values table to allow reading field values
CREATE POLICY "Enable read access for all users"
ON public.field_values
FOR SELECT 
TO authenticated, anon
USING (true);

-- Create RLS policy for field_values table to allow updating field values
CREATE POLICY "Enable update for all users"
ON public.field_values
FOR UPDATE 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Create RLS policy for field_values table to allow deleting field values
CREATE POLICY "Enable delete for all users"
ON public.field_values
FOR DELETE 
TO authenticated, anon
USING (true);
