-- =============================================================
-- SIH Health Memory App — Supabase SQL Schema
-- Paste the whole file into Supabase SQL Editor and Run.
-- Requires: Supabase project (free tier) at supabase.com
--
-- This file is IDEMPOTENT: safe to re-run. Every table creation
-- is guarded by `if not exists`, every column by `add column if
-- not exists`, every index by `if not exists`, and every policy is
-- wrapped in a DO block that checks pg_policies first. Re-running
-- on top of an existing schema (including one created by
-- CRITICAL-FIX.sql / NUCLEAR-FIX.sql) will only ADD missing columns
-- and policies without dropping existing data.
-- =============================================================

-- Enable UUID, pgcrypto extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================
-- PROFILES (extends auth.users)
-- =============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  date_of_birth date,
  sex text,
  gender_identity text,
  height_cm numeric,
  weight_kg numeric,
  blood_group text,
  emergency_contact jsonb default '{}'::jsonb,
  medical_background jsonb default '{}'::jsonb,
  current_medications jsonb default '[]'::jsonb,
  preferences jsonb default '{}'::jsonb,
  avatar_url text,
  abha_address text,
  abha_number text,
  abha_verified_at timestamptz,
  family_members jsonb default '[]'::jsonb,
  active_member_id uuid,
  created_at timestamptz default now()
);

-- Repair: ensure all app-expected columns exist on profiles, even if
-- the table was created by an older version of the schema. Must run
-- BEFORE any index/policy/trigger that references these columns.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists sex text;
alter table public.profiles add column if not exists gender_identity text;
alter table public.profiles add column if not exists height_cm numeric;
alter table public.profiles add column if not exists weight_kg numeric;
alter table public.profiles add column if not exists blood_group text;
alter table public.profiles add column if not exists emergency_contact jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists medical_background jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists current_medications jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists preferences jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists abha_address text;
alter table public.profiles add column if not exists abha_number text;
alter table public.profiles add column if not exists abha_verified_at timestamptz;
alter table public.profiles add column if not exists family_members jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists active_member_id uuid;
alter table public.profiles add column if not exists created_at timestamptz default now();
-- Unique constraints for ABHA identity (safe to re-run — ignored if already exists)
create unique index if not exists idx_profiles_abha_address on public.profiles (abha_address);
create unique index if not exists idx_profiles_abha_number on public.profiles (abha_number);

-- =============================================================
-- HEALTH RECORDS
-- Columns: record_type, title, notes, recorded_at, metadata
-- The app (healthRecordService.js) reads these exact column names.
-- =============================================================
create table if not exists public.health_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_type text not null,
  title text not null,
  notes text,
  recorded_at timestamp with time zone not null default now(),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Repair: ensure columns exist if table was created by an older layout
alter table public.health_records add column if not exists record_type text;
alter table public.health_records add column if not exists notes text;
alter table public.health_records add column if not exists recorded_at timestamp with time zone default now();

create index if not exists idx_health_records_user_date
  on public.health_records (user_id, recorded_at desc);
create index if not exists idx_health_records_user_type
  on public.health_records (user_id, record_type);

-- =============================================================
-- DOCTORS (shared directory)
-- =============================================================
create table if not exists public.doctors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  specialty text,
  phone text,
  email text,
  avatar_url text,
  total_visits integer default 0,
  visit_history jsonb default '[]'::jsonb,
  last_visit date,
  rating numeric(2,1) default 4.5,
  experience_years integer,
  hospital text,
  created_at timestamptz default now()
);

-- Repair: add app-expected columns if the table was created by an
-- older version (NUCLEAR-FIX.sql version lacks avatar_url, last_visit, etc.)
alter table public.doctors add column if not exists avatar_url text;
alter table public.doctors add column if not exists last_visit date;
alter table public.doctors add column if not exists rating numeric(2,1) default 4.5;
alter table public.doctors add column if not exists experience_years integer;
alter table public.doctors add column if not exists hospital text;
alter table public.doctors add column if not exists total_visits integer default 0;
alter table public.doctors add column if not exists visit_history jsonb default '[]'::jsonb;

-- =============================================================
-- APPOINTMENTS
-- The app (appointmentService.js) reads: date, time, doctor_name, room, purpose.
-- Must match those exact column names so the app's insert/update queries work.
-- =============================================================
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  doctor_name text,
  date date not null,
  time text,
  status text default 'Upcoming' check (status in ('Upcoming','Completed','Cancelled')),
  room text,
  purpose text,
  created_at timestamptz default now()
);

-- Repair: add app-expected columns if the table was created by an older layout
-- (NUCLEAR-FIX.sql uses scheduled_at instead of date/time).
alter table public.appointments add column if not exists doctor_name text;
alter table public.appointments add column if not exists date date;
alter table public.appointments add column if not exists time text;
alter table public.appointments add column if not exists room text;
alter table public.appointments add column if not exists purpose text;

create index if not exists idx_appointments_user
  on public.appointments (user_id, date desc);

-- =============================================================
-- REMINDERS
-- The app (reminderService.js) reads: date, time, due_date, repeat, category.
-- =============================================================
create table if not exists public.reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text default 'General',
  date date,
  time text,
  due_date timestamptz,
  completed boolean default false,
  repeat text default 'Once' check (repeat in ('Once','Daily','Weekly','Monthly')),
  created_at timestamptz default now()
);

-- Repair: add app-expected columns if the table was created by an older layout
-- (NUCLEAR-FIX.sql uses due_at/repeat_pattern instead of due_date/repeat).
alter table public.reminders add column if not exists category text default 'General';
alter table public.reminders add column if not exists date date;
alter table public.reminders add column if not exists time text;
alter table public.reminders add column if not exists due_date timestamptz;
alter table public.reminders add column if not exists repeat text default 'Once';

create index if not exists idx_reminders_user_due
  on public.reminders (user_id, due_date);

-- =============================================================
-- DOCUMENTS
-- The app (documentService.js) reads: type, file_url, file_format,
-- file_size, thumbnail, doctor, hospital, report_date, ai_summary,
-- extracted_metadata.
-- =============================================================
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  type text default 'Reports',
  file_url text,
  file_format text,
  file_size text,
  thumbnail text,
  doctor text,
  hospital text,
  report_date date,
  ai_summary text,
  extracted_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Repair: add app-expected columns if the table was created by an older layout
-- (NUCLEAR-FIX.sql uses doc_type/uploaded_at instead of type/report_date).
alter table public.documents add column if not exists type text default 'Reports';
alter table public.documents add column if not exists file_format text;
alter table public.documents add column if not exists file_size text;
alter table public.documents add column if not exists thumbnail text;
alter table public.documents add column if not exists doctor text;
alter table public.documents add column if not exists hospital text;
alter table public.documents add column if not exists report_date date;
alter table public.documents add column if not exists extracted_metadata jsonb default '{}'::jsonb;
alter table public.documents add column if not exists created_at timestamptz default now();

create index if not exists idx_documents_user
  on public.documents (user_id, created_at desc);

-- =============================================================
-- AI CHAT HISTORY
-- =============================================================
create table if not exists public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_ai_messages_user
  on public.ai_messages (user_id, created_at);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- Each user only sees/edits their own data (doctor directory is shared)
-- =============================================================

alter table public.profiles enable row level security;
alter table public.health_records enable row level security;
alter table public.appointments enable row level security;
alter table public.reminders enable row level security;
alter table public.documents enable row level security;
alter table public.ai_messages enable row level security;
alter table public.doctors enable row level security;

-- PROFILES
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can view own profile') then
    create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can insert own profile') then
    create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
end $$;

-- HEALTH RECORDS
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='health_records' and policyname='Users can view own health records') then
    create policy "Users can view own health records" on public.health_records for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='health_records' and policyname='Users can insert own health records') then
    create policy "Users can insert own health records" on public.health_records for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='health_records' and policyname='Users can update own health records') then
    create policy "Users can update own health records" on public.health_records for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='health_records' and policyname='Users can delete own health records') then
    create policy "Users can delete own health records" on public.health_records for delete using (auth.uid() = user_id);
  end if;
end $$;

-- DOCTORS (readable by all authenticated users)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doctors' and policyname='Anyone authenticated can read doctors') then
    create policy "Anyone authenticated can read doctors" on public.doctors for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doctors' and policyname='Authenticated users can create doctors') then
    create policy "Authenticated users can create doctors" on public.doctors for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='doctors' and policyname='Authenticated users can update doctors') then
    create policy "Authenticated users can update doctors" on public.doctors for update using (auth.role() = 'authenticated');
  end if;
end $$;

-- APPOINTMENTS
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='appointments' and policyname='Users can view own appointments') then
    create policy "Users can view own appointments" on public.appointments for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='appointments' and policyname='Users can insert own appointments') then
    create policy "Users can insert own appointments" on public.appointments for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='appointments' and policyname='Users can update own appointments') then
    create policy "Users can update own appointments" on public.appointments for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='appointments' and policyname='Users can delete own appointments') then
    create policy "Users can delete own appointments" on public.appointments for delete using (auth.uid() = user_id);
  end if;
end $$;

-- REMINDERS
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reminders' and policyname='Users can view own reminders') then
    create policy "Users can view own reminders" on public.reminders for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reminders' and policyname='Users can insert own reminders') then
    create policy "Users can insert own reminders" on public.reminders for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reminders' and policyname='Users can update own reminders') then
    create policy "Users can update own reminders" on public.reminders for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reminders' and policyname='Users can delete own reminders') then
    create policy "Users can delete own reminders" on public.reminders for delete using (auth.uid() = user_id);
  end if;
end $$;

-- DOCUMENTS
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='documents' and policyname='Users can view own documents') then
    create policy "Users can view own documents" on public.documents for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='documents' and policyname='Users can insert own documents') then
    create policy "Users can insert own documents" on public.documents for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='documents' and policyname='Users can update own documents') then
    create policy "Users can update own documents" on public.documents for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='documents' and policyname='Users can delete own documents') then
    create policy "Users can delete own documents" on public.documents for delete using (auth.uid() = user_id);
  end if;
end $$;

-- AI MESSAGES
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_messages' and policyname='Users can view own AI messages') then
    create policy "Users can view own AI messages" on public.ai_messages for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_messages' and policyname='Users can insert own AI messages') then
    create policy "Users can insert own AI messages" on public.ai_messages for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_messages' and policyname='Users can delete own AI messages') then
    create policy "Users can delete own AI messages" on public.ai_messages for delete using (auth.uid() = user_id);
  end if;
end $$;

-- =============================================================
-- TRIGGER: auto-create profile row when a new auth user signs up
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- SEED DATA: sample doctors
-- =============================================================
insert into public.doctors (name, specialty, phone, email, hospital, rating, experience_years) values
  ('Dr. Sharma', 'General Physician', '+91 98765 11111', 'dr.sharma@example.com', 'ABC Hospital, Indiranagar', 4.8, 15),
  ('Dr. Priya Patel', 'Cardiologist', '+91 98765 22222', 'priya.patel@example.com', 'Fortis Heart Institute', 4.9, 12),
  ('Dr. Mehta', 'Orthopedic Surgeon', '+91 98765 33333', 'mehta.ortho@example.com', 'Apollo Hospitals, Bannerghatta', 4.6, 20),
  ('Dr. Anil Rao', 'Dermatologist', '+91 98765 44444', 'rao.derma@example.com', 'City Skin Clinic', 4.5, 10),
  ('Dr. Kavita Nair', 'Gynecologist', '+91 98765 55555', 'nair.gyn@example.com', 'Cloudnine Hospital', 4.9, 14)
on conflict do nothing;

-- =============================================================
-- FAMILY LINKS
-- =============================================================
-- Family linking requires each family member to be a real Supabase
-- auth user (with a real password). This table maps an "attendant"
-- (the logged-in Supabase user) to one or more "invitees" (the
-- linked family members). RLS keys off auth.uid(), so data scoping
-- for a family member is achieved by re-authenticating as that
-- member — no extra member_id columns needed on health tables.
-- =============================================================

create extension if not exists "uuid-ossp";

create table if not exists public.family_links (
  id uuid primary key default uuid_generate_v4(),
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  relation text not null default 'Family',
  status text not null default 'accepted'
    check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz default now(),
  unique (inviter_id, invitee_id)
);

-- Idempotent repair for older versions
alter table public.family_links add column if not exists relation text not null default 'Family';
alter table public.family_links add column if not exists status text not null default 'accepted';

create index if not exists idx_family_links_inviter on public.family_links (inviter_id);
create index if not exists idx_family_links_invitee on public.family_links (invitee_id);

alter table public.family_links enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='family_links'
                 and policyname='Users can view their own family links') then
    create policy "Users can view their own family links"
      on public.family_links for select
      using (auth.uid() = inviter_id or auth.uid() = invitee_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='family_links'
                 and policyname='Attendants can create family links') then
    create policy "Attendants can create family links"
      on public.family_links for insert
      with check (auth.uid() = inviter_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='family_links'
                 and policyname='Attendants can update their family links') then
    create policy "Attendants can update their family links"
      on public.family_links for update
      using (auth.uid() = inviter_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='family_links'
                 and policyname='Users can delete their family links') then
    create policy "Users can delete their family links"
      on public.family_links for delete
      using (auth.uid() = inviter_id or auth.uid() = invitee_id);
  end if;
end $$;