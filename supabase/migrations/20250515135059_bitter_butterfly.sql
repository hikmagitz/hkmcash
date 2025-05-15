/*
  # Update premium status for specific user

  1. Changes
    - Set is_premium to true for user with email z.elmaddahi@gmail.com
  
  2. Security
    - Uses service role to update profile
*/

DO $$
BEGIN
  UPDATE profiles
  SET is_premium = true
  WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'z.elmaddahi@gmail.com'
  );
END $$;