# 🚨 Do this NOW to unblock the demo

The signup form is throwing an alert saying "Supabase is asking you to confirm the email". Behind the scenes Supabase is returning **HTTP 500** on `/auth/v1/signup` — that's a server-side failure, not a frontend one. The cause is the `handle_new_user` trigger trying to write into a `profiles` table that doesn't have an `email` column.

## One-time fix (3 minutes)

1. Open [https://app.supabase.com](https://app.supabase.com) → your project.
2. Left sidebar → **SQL Editor** → **New query**.
3. Open `supabase-schema.sql` from the project root, copy the whole contents, paste into the editor, click **Run** (or Ctrl+Enter).
   - This file is fully idempotent (safe to re-run). It creates every table if it doesn't exist, and adds any missing columns to tables created by earlier versions of the schema — so you'll never see `column "date" does not exist` or `column "email" does not exist` errors again.
4. Left sidebar → **Authentication** → **Providers** → **Email** → turn **OFF** "Confirm email" (it has to be done in the UI, not in SQL).
5. Refresh the dev server (`Ctrl+C` then `npm run dev` in the project folder).

## Now test

Open `http://localhost:5173` and click **Sign Up**.

- You should be able to click through all 8 steps without the form deselecting itself.
- The "Complete Profile & Open Timeline" button should now redirect you to `/app/home` instead of showing the "Supabase is asking you to confirm" alert.

If it still fails, open the browser DevTools → **Console** and send me whatever red error message you see. It will tell us what else is missing.
