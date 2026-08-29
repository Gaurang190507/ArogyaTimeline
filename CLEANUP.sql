-- =============================================================
-- CLEANUP — Delete stale auth.users so a fresh signup
-- triggers the handle_new_user function and creates a profile.
-- =============================================================

-- 1) Delete the 2 stale auth users (their profile rows don't exist,
--    so no orphan profiles to worry about)
delete from auth.users where email in (
  'nanusaini636@gmail.com',
  'demo+899299@example.com'
);

-- 2) Verify they're gone
select email from auth.users;

-- 3) Verify profiles is empty
select id, email, name from public.profiles;