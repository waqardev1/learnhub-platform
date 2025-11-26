-- =====================================================
-- REMOVE PASSWORD HASHING - REVERT TO PLAIN TEXT
-- Run this script in Supabase SQL Editor
-- =====================================================

-- 1. Drop the trigger and function
DROP TRIGGER IF EXISTS hash_user_password ON public.users;
DROP FUNCTION IF EXISTS hash_password();
DROP FUNCTION IF EXISTS verify_password(text, text);

-- 2. Reset admin password to plain text
UPDATE public.users
SET password = 'admin123'
WHERE role = 'admin';

-- 3. Reset all student passwords to a default
-- You can change individual passwords later
UPDATE public.users
SET password = 'student123'
WHERE role = 'student';

-- 4. Verify the changes
SELECT user_id, email, full_name, role, password
FROM public.users
ORDER BY role, user_id;
