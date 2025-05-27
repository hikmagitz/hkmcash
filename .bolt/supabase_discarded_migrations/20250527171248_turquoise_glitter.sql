/*
  # Add user scoping for clients and categories

  1. Changes
    - Add user_id column to clients table
    - Add user_id column to categories table
    - Add foreign key constraints to link with users table
    - Add RLS policies for user-scoped access
    
  2. Security
    - Enable RLS on both tables
    - Add policies to ensure users can only access their own data
*/

-- Add user_id to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add user_id to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

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