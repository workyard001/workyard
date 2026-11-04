# WORKYARD

Next.js 14 App Router + Tailwind + Supabase starter, configured for Cloudflare Pages static export.

## Run locally
1. Install Node.js 20+ and Git.
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

## Supabase setup
1. Create a Supabase project.
2. In SQL Editor, run `supabase/schema.sql`.
3. Enable Phone provider in Authentication → Providers. Configure an SMS provider and OTP settings.
4. Configure Nigeria phone numbers in E.164 format (`+234...`).
5. Create an admin by inserting the admin user's auth UUID into `public.admins` from SQL Editor:
   `insert into public.admins(user_id) values ('AUTH-USER-UUID');`
6. Configure Storage identity document bucket and review uploads manually before approval.

## Cloudflare Pages deploy
- Framework preset: **Next.js (Static HTML Export)** / or **None** with build command `npm run build`.
- Build command: `npm run build`
- Build output directory: `out`
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as build environment variables.
- `wrangler.toml` declares the Pages output directory.

## Git push from Windows CMD
```bat
cd C:\path\to\workyard
git init
git add .
git commit -m "Build WORKYARD community jobs homepage"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/workyard.git
git push -u origin main
```
If the repo is already cloned and connected:
```bat
git add .
git commit -m "Update WORKYARD"
git push
```

## Security implementation notes
- SQL enables RLS on all application tables and the admins table.
- Public worker reads are restricted to verified, non-banned workers; owners/admins can read their own/relevant records.
- Phone OTP helper is included in `src/lib/supabase.ts`.
- Identity documents are stored in a private bucket, capped at 2 MB; use only signed URLs for admin review.
- The static-export frontend cannot safely hold service-role credentials or run server routes. Add Supabase Edge Functions for job-post rate limiting, image scanning (e.g. a trusted scanner/API), admin approve/ban actions, and logging WhatsApp contact clicks. Do not expose service-role keys in `NEXT_PUBLIC_*`.
- The homepage uses sample profiles for the visual preview. Wire Supabase queries and interactive auth/forms before accepting production users.
