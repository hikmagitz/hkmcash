/*
  # Add enterprise settings and categories tables
  
  1. New Tables
    - `enterprise_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `type` (text)
      - `color` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create enterprise_settings table
CREATE TABLE IF NOT EXISTS enterprise_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for enterprise_settings
ALTER TABLE enterprise_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for enterprise_settings
CREATE POLICY "Users can view their own enterprise settings"
  ON enterprise_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own enterprise settings"
  ON enterprise_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own enterprise settings"
  ON enterprise_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Users can view their own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_enterprise_settings_updated_at
  BEFORE UPDATE ON enterprise_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();