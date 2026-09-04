-- =============================================================
-- CRITICAL: Run this in Supabase SQL Editor
-- https://app.supabase.com → Project → SQL Editor → New query
-- Paste the whole file → Run (Ctrl+Enter)
--
-- This is the *single* thing blocking signup right now.
-- The auth trigger tries to write `email` into `profiles`,
-- but that column was never created. Hence the HTTP 500.
--
-- NOTE: PostgreSQL does NOT support "create policy if not exists".
-- Instead we use a safe helper via DO blocks.
-- =============================================================

-- 1) Add the missing email column (safe to re-run)
alter table public.profiles add column if not exists email text;
create index if not exists idx_profiles_email on public.profiles (email);

-- 2) Add the preferences jsonb column too (used by the app)
alter table public.profiles
  add column if not exists preferences jsonb default '{}'::jsonb;

-- 3) Replace the broken trigger with a corrected one
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

-- 4) Ensure the medical-documents storage bucket exists (public read)
insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', true)
on conflict (id) do update set public = true;

-- ──────────────────────────────────────────────────────────────
-- 5) Storage RLS policies (via DO blocks — handles re-runs)
-- ──────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'Public read medical documents'
  ) then
    create policy "Public read medical documents"
      on storage.objects for select
      using (bucket_id = 'medical-documents');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'Authenticated upload medical documents'
  ) then
    create policy "Authenticated upload medical documents"
      on storage.objects for insert
      with check (bucket_id = 'medical-documents');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'Authenticated update medical documents'
  ) then
    create policy "Authenticated update medical documents"
      on storage.objects for update
      using (bucket_id = 'medical-documents');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'Authenticated delete own medical documents'
  ) then
    create policy "Authenticated delete own medical documents"
      on storage.objects for delete
      using (
        bucket_id = 'medical-documents'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- ──────────────────────────────────────────────────────────────
-- 6) Create the health_records, vitals, doctors, appointments,
--    documents, reminders tables the rest of the app needs.
--    All RLS-enabled, all owned by the current user.
-- ──────────────────────────────────────────────────────────────

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_type text not null,
  title text not null,
  notes text,
  recorded_at timestamp with time zone not null default now(),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);
-- Repair any pre-existing tables that are missing newer columns
alter table public.health_records add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.health_records add column if not exists record_type text;
alter table public.health_records add column if not exists title text;
alter table public.health_records add column if not exists notes text;
alter table public.health_records add column if not exists recorded_at timestamp with time zone default now();
alter table public.health_records add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.health_records add column if not exists created_at timestamp with time zone default now();
alter table public.health_records enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'health_records' and policyname = 'Users manage own health_records'
  ) then
    create policy "Users manage own health_records"
      on public.health_records for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_health_records_user
  on public.health_records (user_id, recorded_at desc);

create table if not exists public.vitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_at timestamp with time zone not null default now(),
  systolic integer,
  diastolic integer,
  heart_rate integer,
  weight_kg numeric,
  glucose_mg_dl numeric,
  spo2 integer,
  temperature_c numeric,
  notes text,
  created_at timestamp with time zone default now()
);
-- Repair pre-existing tables missing columns
alter table public.vitals add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.vitals add column if not exists recorded_at timestamp with time zone default now();
alter table public.vitals add column if not exists systolic integer;
alter table public.vitals add column if not exists diastolic integer;
alter table public.vitals add column if not exists heart_rate integer;
alter table public.vitals add column if not exists weight_kg numeric;
alter table public.vitals add column if not exists glucose_mg_dl numeric;
alter table public.vitals add column if not exists spo2 integer;
alter table public.vitals add column if not exists temperature_c numeric;
alter table public.vitals add column if not exists notes text;
alter table public.vitals add column if not exists created_at timestamp with time zone default now();
alter table public.vitals enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vitals' and policyname = 'Users manage own vitals'
  ) then
    create policy "Users manage own vitals"
      on public.vitals for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_vitals_user
  on public.vitals (user_id, recorded_at desc);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  hospital text,
  phone text,
  email text,
  address text,
  rating numeric default 0,
  total_visits integer default 0,
  visit_history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);
-- Repair pre-existing tables missing columns
alter table public.doctors add column if not exists name text;
alter table public.doctors add column if not exists specialty text;
alter table public.doctors add column if not exists hospital text;
alter table public.doctors add column if not exists phone text;
alter table public.doctors add column if not exists email text;
alter table public.doctors add column if not exists address text;
alter table public.doctors add column if not exists rating numeric default 0;
alter table public.doctors add column if not exists total_visits integer default 0;
alter table public.doctors add column if not exists visit_history jsonb default '[]'::jsonb;
alter table public.doctors add column if not exists created_at timestamp with time zone default now();
alter table public.doctors enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'doctors' and policyname = 'Authenticated read doctors'
  ) then
    create policy "Authenticated read doctors"
      on public.doctors for select
      to authenticated
      using (true);
  end if;
end $$;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  scheduled_at timestamp with time zone not null,
  reason text,
  status text default 'Scheduled',
  location text,
  notes text,
  created_at timestamp with time zone default now()
);
-- Repair pre-existing tables missing columns
alter table public.appointments add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.appointments add column if not exists doctor_id uuid references public.doctors(id) on delete set null;
alter table public.appointments add column if not exists scheduled_at timestamp with time zone;
alter table public.appointments add column if not exists reason text;
alter table public.appointments add column if not exists status text default 'Scheduled';
alter table public.appointments add column if not exists location text;
alter table public.appointments add column if not exists notes text;
alter table public.appointments add column if not exists created_at timestamp with time zone default now();
alter table public.appointments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'appointments' and policyname = 'Users manage own appointments'
  ) then
    create policy "Users manage own appointments"
      on public.appointments for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_appointments_user
  on public.appointments (user_id, scheduled_at);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  doc_type text,
  file_url text,
  thumbnail_url text,
  ai_summary text,
  metadata jsonb default '{}'::jsonb,
  uploaded_at timestamp with time zone default now()
);
-- Repair pre-existing tables missing columns
alter table public.documents add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.documents add column if not exists title text;
alter table public.documents add column if not exists doc_type text;
alter table public.documents add column if not exists file_url text;
alter table public.documents add column if not exists thumbnail_url text;
alter table public.documents add column if not exists ai_summary text;
alter table public.documents add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.documents add column if not exists uploaded_at timestamp with time zone default now();
alter table public.documents enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents' and policyname = 'Users manage own documents'
  ) then
    create policy "Users manage own documents"
      on public.documents for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamp with time zone not null,
  repeat_pattern text default 'Once',
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
-- Repair pre-existing tables missing columns
alter table public.reminders add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.reminders add column if not exists title text;
alter table public.reminders add column if not exists description text;
alter table public.reminders add column if not exists due_at timestamp with time zone;
alter table public.reminders add column if not exists repeat_pattern text default 'Once';
alter table public.reminders add column if not exists completed boolean default false;
alter table public.reminders add column if not exists completed_at timestamp with time zone;
alter table public.reminders add column if not exists created_at timestamp with time zone default now();
alter table public.reminders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'Users manage own reminders'
  ) then
    create policy "Users manage own reminders"
      on public.reminders for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_reminders_user
  on public.reminders (user_id, due_at);

-- 7) DONE. Now go to:
--    Authentication → Providers → Email → turn OFF "Confirm email"
--    (this is required for the demo — cannot be done in SQL)