-- =============================================================
-- NUCLEAR FIX — Run this in Supabase SQL Editor
-- This DROPS everything that was built wrong and rebuilds clean.
-- ⚠️ This will delete any data in: profiles, health_records,
--    vitals, doctors, appointments, documents, reminders.
--    Auth users are NOT touched.
-- =============================================================

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ STEP 1: Nuke all RLS policies on the affected tables       ║
-- ╚═══════════════════════════════════════════════════════════╝
do $$
declare r record;
begin
  for r in
    select policyname, schemaname, tablename
    from pg_policies
    where schemaname in ('public', 'storage')
      and tablename in (
        'profiles', 'health_records', 'vitals', 'doctors',
        'appointments', 'documents', 'reminders', 'objects'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ STEP 2: Drop the old trigger (so we can rebuild it fresh)  ║
-- ╚═══════════════════════════════════════════════════════════╝
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ STEP 3: Wipe and rebuild profiles with the CORRECT shape   ║
-- ╚═══════════════════════════════════════════════════════════╝
drop table if exists public.health_records cascade;
drop table if exists public.vitals cascade;
drop table if exists public.appointments cascade;
drop table if exists public.documents cascade;
drop table if exists public.reminders cascade;
drop table if exists public.doctors cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
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
  created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create index idx_profiles_email on public.profiles (email);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ STEP 4: Rebuild the auth trigger with the email column     ║
-- ╚═══════════════════════════════════════════════════════════╝
create function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ STEP 5: Build the rest of the schema                       ║
-- ╚═══════════════════════════════════════════════════════════╝
create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_type text not null,
  title text not null,
  notes text,
  recorded_at timestamp with time zone not null default now(),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);
alter table public.health_records enable row level security;
create policy "Users manage own health_records"
  on public.health_records for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index idx_health_records_user on public.health_records (user_id, recorded_at desc);

create table public.vitals (
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
alter table public.vitals enable row level security;
create policy "Users manage own vitals"
  on public.vitals for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index idx_vitals_user on public.vitals (user_id, recorded_at desc);

create table public.doctors (
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
alter table public.doctors enable row level security;
create policy "Authenticated read doctors"
  on public.doctors for select
  to authenticated
  using (true);

create table public.appointments (
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
alter table public.appointments enable row level security;
create policy "Users manage own appointments"
  on public.appointments for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index idx_appointments_user on public.appointments (user_id, scheduled_at);

create table public.documents (
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
alter table public.documents enable row level security;
create policy "Users manage own documents"
  on public.documents for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.reminders (
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
alter table public.reminders enable row level security;
create policy "Users manage own reminders"
  on public.reminders for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index idx_reminders_user on public.reminders (user_id, due_at);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ STEP 6: Storage bucket + policies                          ║
-- ╚═══════════════════════════════════════════════════════════╝
insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', true)
on conflict (id) do update set public = true;

create policy "Public read medical documents"
  on storage.objects for select
  using (bucket_id = 'medical-documents');

create policy "Authenticated upload medical documents"
  on storage.objects for insert
  with check (bucket_id = 'medical-documents');

create policy "Authenticated update medical documents"
  on storage.objects for update
  using (bucket_id = 'medical-documents');

create policy "Authenticated delete own medical documents"
  on storage.objects for delete
  using (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ╔═══════════════════════════════════════════════════════════╗
-- ║ DONE. Now:                                                  ║
-- ║  1. Authentication → Providers → Email → turn OFF           ║
-- ║     "Confirm email"                                         ║
-- ║  2. Authentication → Users → delete any old test users      ║
-- ║  3. Restart dev server (Ctrl+C then npm run dev)            ║
-- ║  4. Go to /signup and try again                             ║
-- ╚═══════════════════════════════════════════════════════════╝