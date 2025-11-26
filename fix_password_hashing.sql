-- =====================================================
-- PASSWORD HASHING FIX FOR LEARNHUB
-- Run this script in Supabase SQL Editor
-- =====================================================

-- 1. Enable pgcrypto extension (required for bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS hash_user_password ON public.users;
DROP FUNCTION IF EXISTS hash_password();

-- 3. Create the password hashing function
CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if password is being set/changed
  IF NEW.password IS NOT NULL THEN
    -- Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    IF NEW.password !~ '^\\$2[aby]\\$' THEN
      -- Hash the password using bcrypt
      NEW.password = crypt(NEW.password, gen_salt('bf', 10));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to automatically hash passwords on INSERT and UPDATE
CREATE TRIGGER hash_user_password
  BEFORE INSERT OR UPDATE OF password ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION hash_password();

-- 5. Hash all existing plain-text passwords
-- This will update any passwords that don't start with $2a$, $2b$, or $2y$
UPDATE public.users
SET password = crypt(password, gen_salt('bf', 10))
WHERE password !~ '^\\$2[aby]\\$';

-- 6. Verify the fix
-- Check how many users have hashed passwords
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN password ~ '^\\$2[aby]\\$' THEN 1 END) as hashed_passwords,
  COUNT(CASE WHEN password !~ '^\\$2[aby]\\$' THEN 1 END) as plain_text_passwords
FROM public.users;

-- 7. Show sample of users (without showing actual passwords)
SELECT 
  user_id,
  full_name,
  role,
  CASE 
    WHEN password ~ '^\\$2[aby]\\$' THEN '✅ Hashed'
    ELSE '❌ Plain Text'
  END as password_status
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
