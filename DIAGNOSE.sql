-- Paste this entire file into SQL Editor → Run.
-- Each section shows up as a separate result tab in Supabase.

-- ═══ QUERY 1: Auth Users ═══
select email, id, created_at from auth.users order by created_at desc;

-- ═══ QUERY 2: Profiles ═══
select id, email, name from public.profiles;

-- ═══ QUERY 3: Profiles Columns ═══
select column_name from information_schema.columns where table_name='profiles' order by ordinal_position;

-- ═══ QUERY 4: Trigger Function ═══
select pg_get_functiondef(oid) from pg_proc where proname='handle_new_user';

-- ═══ QUERY 5: Storage Buckets ═══
select id, name, public from storage.buckets;