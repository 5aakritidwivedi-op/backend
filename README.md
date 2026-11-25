# Cadence Events

The repository contains a Flask Events API and its browser frontend. The frontend is served from `public/` and calls the API from the same URL.

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in **Project Settings → Environment Variables**.
3. Deploy. Vercel detects the Flask app in `app.py`; no build command is needed.

The dashboard is available at `/`, the API is under `/api`, and `/health` is available for uptime checks.
