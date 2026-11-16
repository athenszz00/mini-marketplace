# little finds

A no-login neighborhood marketplace built with Next.js, React, and Supabase.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable key.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Start the app with `npm run dev`.

The schema enables anonymous listing creation, public listing reads, public photo uploads, and anonymous message insertion. Messages are not publicly readable. The publishable key is intended for browser use; do not use a service-role key here.

Without Supabase credentials the app runs in preview mode with sample listings; creating real listings and saving messages require Supabase configuration. Supabase emails are displayed to prospective buyers, but sending an email notification on new messages requires a separately configured Edge Function and email provider.

Deploy to Vercel after setting `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as project environment variables.
