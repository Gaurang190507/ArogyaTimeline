-- =============================================================
-- SIH Health Memory App — Supabase SQL Schema
-- Paste the whole file into Supabase SQL Editor and Run.
-- Requires: Supabase project (free tier) at supabase.com
-- =============================================================

-- Enable UUID, pgcrypto extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================
-- PROFILES (extends auth.users)
-- =============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
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
  created_at timestamptz default now()
);

-- =============================================================
-- HEALTH RECORDS
-- =============================================================
create table if not exists public.health_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in (
    'blood_pressure','weight','blood_sugar','doctor_visit','document',
    'medicine','note','symptom','temperature'
  )),
  title text,
  description text,
  date date default current_date,
  time text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_health_records_user_date
  on public.health_records (user_id, date desc);
create index if not exists idx_health_records_user_type
  on public.health_records (user_id, type);

-- =============================================================
-- DOCTORS (shared directory)
-- =============================================================
create table if not exists public.doctors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  specialty text,
  phone text,
  email text,
  avatar_url text default 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  total_visits integer default 0,
  visit_history jsonb default '[]'::jsonb,
  last_visit date,
  rating numeric(2,1) default 4.5,
  experience_years integer,
  hospital text,
  created_at timestamptz default now()
);

-- =============================================================
-- APPOINTMENTS
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

create index if not exists idx_appointments_user
  on public.appointments (user_id, date desc);

-- =============================================================
-- REMINDERS
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

create index if not exists idx_reminders_user_due
  on public.reminders (user_id, due_date);

-- =============================================================
-- DOCUMENTS
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
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- HEALTH RECORDS
create policy "Users can view own health records"
  on public.health_records for select using (auth.uid() = user_id);
create policy "Users can insert own health records"
  on public.health_records for insert with check (auth.uid() = user_id);
create policy "Users can update own health records"
  on public.health_records for update using (auth.uid() = user_id);
create policy "Users can delete own health records"
  on public.health_records for delete using (auth.uid() = user_id);

-- DOCTORS (readable by all authenticated users)
create policy "Anyone authenticated can read doctors"
  on public.doctors for select using (auth.role() = 'authenticated');
create policy "Authenticated users can create doctors"
  on public.doctors for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update doctors"
  on public.doctors for update using (auth.role() = 'authenticated');

-- APPOINTMENTS
create policy "Users can view own appointments"
  on public.appointments for select using (auth.uid() = user_id);
create policy "Users can insert own appointments"
  on public.appointments for insert with check (auth.uid() = user_id);
create policy "Users can update own appointments"
  on public.appointments for update using (auth.uid() = user_id);
create policy "Users can delete own appointments"
  on public.appointments for delete using (auth.uid() = user_id);

-- REMINDERS
create policy "Users can view own reminders"
  on public.reminders for select using (auth.uid() = user_id);
create policy "Users can insert own reminders"
  on public.reminders for insert with check (auth.uid() = user_id);
create policy "Users can update own reminders"
  on public.reminders for update using (auth.uid() = user_id);
create policy "Users can delete own reminders"
  on public.reminders for delete using (auth.uid() = user_id);

-- DOCUMENTS
create policy "Users can view own documents"
  on public.documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents"
  on public.documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents"
  on public.documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents"
  on public.documents for delete using (auth.uid() = user_id);

-- AI MESSAGES
create policy "Users can view own AI messages"
  on public.ai_messages for select using (auth.uid() = user_id);
create policy "Users can insert own AI messages"
  on public.ai_messages for insert with check (auth.uid() = user_id);
create policy "Users can delete own AI messages"
  on public.ai_messages for delete using (auth.uid() = user_id);

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