-- =============================================================
-- SIH Health Memory — SUPABASE FIXES (run this in SQL Editor)
-- Fixes: missing email column on profiles → signup was failing
-- Also ensures storage bucket + policies exist.
-- =============================================================

-- 1) Add the missing email column to profiles (safe re-run)
alter table public.profiles add column if not exists email text;
create index if not exists idx_profiles_email on public.profiles (email);

-- Also ensure preferences column exists (used by authService)
alter table public.profiles add column if not exists preferences jsonb default '{}'::jsonb;

-- 2) Recreate the trigger with the FIXED insert (includes email column now)
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

-- 3) Ensure the medical-documents storage bucket exists (public read)
insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', true)
on conflict (id) do update set public = true;

-- 4) Storage policies
create policy if not exists "Public read medical documents"
  on storage.objects for select
  using (bucket_id = 'medical-documents');

create policy if not exists "Authenticated upload medical documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'medical-documents');

create policy if not exists "Authenticated update medical documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'medical-documents');

create policy if not exists "Authenticated delete own medical documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5) IMPORTANT: disable email confirmation for smooth hackathon demo
-- In Dashboard → Authentication → Providers → Email → Confirm email = OFF
-- (do this in the UI, can't be done in SQL)