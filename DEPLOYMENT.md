# Deploying StudyBridge (free path)

This deploys the app across three free services:

| Piece | Service | Free tier notes |
|-------|---------|-----------------|
| Database | **Neon** | Serverless Postgres, persistent, ~0.5 GB. Auto-suspends when idle. |
| Backend | **Render** | Docker web service. Sleeps after 15 min idle (~30–60 s cold start). |
| Frontend | **Vercel** | Static SPA hosting. |

Uploaded PDFs are stored **in the database** (table `document_contents`), so they survive
backend restarts/redeploys even though the host's filesystem is ephemeral.

You will need free accounts on **GitHub**, **Neon**, **Render**, and **Vercel**.

---

## Step 1 — Push the code to GitHub

Render and Vercel both deploy from a Git repo. This project isn't a git repo yet.

```bash
cd /Users/youssefmazen/Documents/studybridge
git init
git add .
git commit -m "StudyBridge: side-by-side translation + deploy config"

# Create the GitHub repo and push (needs the GitHub CLI `gh`, or create the repo in the browser):
gh repo create studybridge --private --source=. --remote=origin --push
# …or manually:
#   git remote add origin https://github.com/<you>/studybridge.git
#   git branch -M main && git push -u origin main
```

> `backend/.env` (your DeepL key) and `frontend/.env` are git-ignored, so secrets are NOT pushed.
> You'll set them as environment variables in Render/Vercel instead.

---

## Step 2 — Create the database (Neon)

1. Go to https://neon.tech → sign up → **Create project** (any name/region).
2. After it's created, open **Connection Details** and copy the connection string. It looks like:
   ```
   postgresql://alex:npg_AbC123@ep-cool-name-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Split it into the three values Render needs (note the `jdbc:` prefix on the URL):

   | Render variable | Value from the string above |
   |---|---|
   | `DATABASE_URL` | `jdbc:postgresql://ep-cool-name-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
   | `DATABASE_USERNAME` | `alex` |
   | `DATABASE_PASSWORD` | `npg_AbC123` |

   Keep `?sslmode=require` — Neon refuses non-SSL connections. The tables are created
   automatically on first boot (`JPA_DDL_AUTO=update`).

---

## Step 3 — Deploy the backend (Render)

1. Go to https://render.com → **New +** → **Blueprint** → connect your GitHub repo.
   Render reads [`render.yaml`](render.yaml) and proposes the `studybridge-backend` service. Click **Apply**.
   *(If you prefer: New + → Web Service → pick the repo → Runtime "Docker", Dockerfile path
   `backend/Dockerfile`, Docker context `backend`, Plan Free.)*
2. Open the service → **Environment** and fill in the values marked `sync: false`:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | from Step 2 |
   | `DATABASE_USERNAME` | from Step 2 |
   | `DATABASE_PASSWORD` | from Step 2 |
   | `JWT_SECRET` | a long random string — generate with `openssl rand -base64 48` |
   | `DEEPL_API_KEY` | your DeepL key, e.g. `xxxxxxxx:fx` |
   | `CORS_ORIGINS` | leave blank for now — set it in Step 5 |

   (`SPRING_PROFILES_ACTIVE=prod`, `JPA_DDL_AUTO=update`, `TRANSLATION_PROVIDER=deepl` are
   already set by the blueprint.)
3. **Save** → Render builds the Docker image and deploys. First build takes a few minutes.
4. When live, copy the backend URL, e.g. `https://studybridge-backend.onrender.com`.

Quick check: `curl https://studybridge-backend.onrender.com/api/v1/documents` should return
`401` (unauthorized) — that means it's up and security is working.

---

## Step 4 — Deploy the frontend (Vercel)

1. Go to https://vercel.com → **Add New… → Project** → import your GitHub repo.
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` · **Output Directory**: `dist` (defaults are fine)
3. Add an **Environment Variable**:
   | Name | Value |
   |---|---|
   | `VITE_API_BASE_URL` | your Render backend URL from Step 3 (no trailing slash) |
4. **Deploy**. When done, copy the frontend URL, e.g. `https://studybridge.vercel.app`.

> `VITE_*` vars are baked in at build time. If you change `VITE_API_BASE_URL` later, redeploy.
> Client-side routes (e.g. `/documents/1`) work because [`vercel.json`](frontend/vercel.json)
> rewrites everything to `index.html`.

---

## Step 5 — Connect the two (CORS)

The backend only accepts browser requests from origins you allow.

1. In **Render** → backend service → **Environment**, set:
   ```
   CORS_ORIGINS = https://studybridge.vercel.app
   ```
   (your exact Vercel URL, no trailing slash; comma-separate multiple origins).
2. Save — Render redeploys automatically.

---

## Step 6 — Verify

1. Open your Vercel URL, register an account, log in.
2. Create a course, upload a lecture PDF.
3. Open the document → pick a target language → **Generate**.
   You should see the rendered PDF on the left and the DeepL translation aligned page-by-page
   on the right.
4. Redeploy the backend (or wait for it to sleep and wake) and confirm the document is still
   there — that proves DB-backed file storage is working.

---

## Good to know (free-tier limits)

- **Cold starts**: the Render free backend sleeps after ~15 min idle. The first request then
  takes ~30–60 s while it wakes (and Neon may also wake from suspend). Subsequent requests are fast.
- **DeepL Free**: ~500k characters/month. The app shows a clear message if you ever exhaust it;
  your key works unchanged if you later upgrade to DeepL Pro.
- **Neon storage**: ~0.5 GB free. Since PDFs live in the DB, that's roughly 100+ small lecture
  decks. Delete old documents to reclaim space.
- **Upload size**: capped at 20 MB per file (`spring.servlet.multipart.max-file-size`).
- **Secrets**: never commit `backend/.env`. It stays local; production reads Render's env vars.

## Optional: custom domain
Both Vercel and Render let you attach a custom domain for free (you provide the domain). Add it in
each dashboard, then add the new frontend domain to `CORS_ORIGINS` on the backend.
