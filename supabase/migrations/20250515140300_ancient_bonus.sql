/*
  # Add transactions table
  
  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `description` (text)
      - `category` (text)
      - `type` (text)
      - `date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on transactions table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());