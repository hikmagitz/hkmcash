/*
  # User-scoped data migration
  
  1. Changes
    - Add user_id column to clients and categories tables
    - Enable RLS on both tables
    - Add policies for user data access control
  
  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
    - Ensure users can only access their own data
*/

-- Add user_id to clients table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add user_id to categories table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE categories ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop clients policies
  DROP POLICY IF EXISTS "Users can create their own clients" ON clients;
  DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
  DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
  DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
  
  -- Drop categories policies
  DROP POLICY IF EXISTS "Users can create their own categories" ON categories;
  DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
  DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
  DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
END $$;

-- Create policies for clients
CREATE POLICY "Users can create their own clients"
ON clients FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own clients"
ON clients FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
ON clients FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
ON clients FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create policies for categories
CREATE POLICY "Users can create their own categories"
ON categories FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own categories"
ON categories FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON categories FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON categories FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);