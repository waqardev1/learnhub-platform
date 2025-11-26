
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. COURSES TABLE
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  duration text,
  price text,
  outline text, -- Rich text or JSON
  roadmap text, -- Rich text or JSON
  resources jsonb, -- Array of links/books
  playlist_id text, -- YouTube Playlist ID
  meet_link text, -- Google Meet Link
  is_visible boolean default true,
  category text, -- Course category (programming, design, business, etc.)
  tags text -- Comma-separated tags for filtering
);

-- 2. REQUESTS TABLE (Public Inquiries)
create table public.requests (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text not null,
  phone text not null,
  course_id uuid references public.courses(id),
  status text default 'pending' -- pending, approved, rejected
);

-- 3. USERS TABLE (Students)
-- We are using a custom table instead of Supabase Auth for the specific "User ID" requirement
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id text not null unique, -- The custom ID (e.g., STU-2024-001)
  password text not null, -- Plain text for simplicity as requested (or hashed if preferred)
  full_name text not null,
  email text,
  phone text,
  role text default 'student', -- student, admin
  enrolled_courses jsonb -- Array of course IDs
);

-- 4. ENROLLMENTS TABLE
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  status text default 'active', -- active, completed, dropped
  enrolled_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  unique(user_id, course_id)
);

-- 5. PROGRESS TRACKING TABLE
create table public.progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id text,
  progress_percentage integer default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  last_accessed timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, course_id, lesson_id)
);

-- 6. WISHLIST TABLE
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  added_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, course_id)
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
alter table public.courses enable row level security;
alter table public.requests enable row level security;
alter table public.users enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.wishlist enable row level security;

-- COURSES POLICIES
-- Public can view visible courses
create policy "Public can view visible courses"
  on public.courses for select
  using (is_visible = true);

-- Anyone can view all courses (for admin panel)
create policy "Allow all to view courses for admin"
  on public.courses for select
  using (true);

-- Allow all operations for now (will be restricted with proper auth later)
create policy "Allow all operations on courses"
  on public.courses for all
  using (true);

-- REQUESTS POLICIES
-- Anyone can submit a request
create policy "Anyone can submit requests"
  on public.requests for insert
  with check (true);

-- Allow all to view/manage requests (for admin panel)
create policy "Allow all operations on requests"
  on public.requests for all
  using (true);

-- USERS POLICIES
-- Allow all operations (custom auth in app)
create policy "Allow all operations on users"
  on public.users for all
  using (true);

-- ENROLLMENTS POLICIES
create policy "Allow all operations on enrollments"
  on public.enrollments for all
  using (true);

-- PROGRESS POLICIES
create policy "Allow all operations on progress"
  on public.progress for all
  using (true);

-- WISHLIST POLICIES
create policy "Allow all operations on wishlist"
  on public.wishlist for all
  using (true);

-- PASSWORD HASHING
-- Enable pgcrypto extension for password hashing
create extension if not exists pgcrypto;

-- Function to hash passwords before storing
create or replace function hash_password()
returns trigger as $$
begin
  -- Only hash if password is being set/changed and is not already hashed
  if new.password is not null and new.password != old.password then
    -- Check if password looks like it's already hashed (starts with $2)
    if new.password !~ '^\$2[aby]\$' then
      new.password = crypt(new.password, gen_salt('bf', 10));
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically hash passwords
drop trigger if exists hash_user_password on public.users;
create trigger hash_user_password
  before insert or update of password on public.users
  for each row
  execute function hash_password();

-- Helper function to verify passwords
create or replace function verify_password(user_id_input text, password_input text)
returns boolean as $$
declare
  stored_password text;
begin
  select password into stored_password
  from public.users
  where user_id = user_id_input;
  
  if stored_password is null then
    return false;
  end if;
  
  return stored_password = crypt(password_input, stored_password);
end;
$$ language plpgsql security definer;
