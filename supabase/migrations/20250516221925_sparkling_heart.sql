/*
  # Add client field to transactions table
  
  1. Changes
    - Add optional client field to transactions table
*/

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS client text;