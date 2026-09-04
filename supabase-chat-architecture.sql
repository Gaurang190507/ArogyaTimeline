-- =============================================================
-- AAROGYA HEALTH MEMORY: CHAT SESSIONS & MESSAGES (WITH RLS)
-- Run this in your Supabase SQL Editor.
-- Safe to re-run: Idempotent with IF NOT EXISTS checks.
-- =============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. CHAT SESSIONS
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default 'Health Consultation',
  created_at timestamptz default now()
);

alter table public.chat_sessions add column if not exists title text default 'Health Consultation';
alter table public.chat_sessions add column if not exists created_at timestamptz default now();

create index if not exists idx_chat_sessions_user 
  on public.chat_sessions (user_id, created_at desc);

-- 2. CHAT MESSAGES
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.chat_messages add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.chat_messages add column if not exists created_at timestamptz default now();

create index if not exists idx_chat_messages_session 
  on public.chat_messages (session_id, created_at asc);
create index if not exists idx_chat_messages_user 
  on public.chat_messages (user_id, created_at asc);

-- 3. ROW LEVEL SECURITY (RLS)
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Policies for chat_sessions
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='Users can view own chat sessions') then
    create policy "Users can view own chat sessions" on public.chat_sessions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='Users can insert own chat sessions') then
    create policy "Users can insert own chat sessions" on public.chat_sessions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='Users can update own chat sessions') then
    create policy "Users can update own chat sessions" on public.chat_sessions for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='Users can delete own chat sessions') then
    create policy "Users can delete own chat sessions" on public.chat_sessions for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Policies for chat_messages
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='Users can view own chat messages') then
    create policy "Users can view own chat messages" on public.chat_messages for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='Users can insert own chat messages') then
    create policy "Users can insert own chat messages" on public.chat_messages for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='Users can update own chat messages') then
    create policy "Users can update own chat messages" on public.chat_messages for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='Users can delete own chat messages') then
    create policy "Users can delete own chat messages" on public.chat_messages for delete using (auth.uid() = user_id);
  end if;
end $$;
