# Chirpify — Deployment Setup Guide

Complete checklist to get Chirpify live on **Vercel + Supabase + Google OAuth**.

Stack in one sentence for interviews:
> *Next.js app on Vercel, PostgreSQL database and file storage on Supabase, authentication via NextAuth with Google OAuth.*

---

## Part 1 — Supabase (database + file storage)

### 1.1 Create project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Pick a name (e.g. `chirpify`), set a **strong database password** (save it)
3. Choose a region close to your users
4. Wait ~2 minutes for provisioning

### 1.2 Create storage bucket

1. In Supabase dashboard → **Storage** → **New bucket**
2. Name: `uploads`
3. Toggle **Public bucket** → ON
4. Click **Create bucket**

### 1.3 Storage policy (allow public reads)

1. Open the `uploads` bucket → **Policies**
2. Add policy for public read (or use SQL below in **SQL Editor**):

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');
```

> Service-role uploads from the API bypass RLS, so you only need a read policy for public media.

### 1.4 Push database schema

Copy `.env.example` → `.env.local` and fill in Supabase values (see Part 3 for all keys).

From the project root:

```bash
npm install
npm run db:push
```

This creates all tables (NextAuth users/sessions + posts/comments/likes).

### 1.5 Collect Supabase env vars

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role (secret) |
| `DATABASE_URL` | Settings → Database → Connection string → **URI** tab → choose **Transaction pooler** (port **6543**) |

> **Important:** Use the **Transaction pooler** connection string for Vercel/serverless, not the direct connection (port 5432).

---

## Part 2 — Google OAuth

### 2.1 Configure OAuth client

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → your project
2. **APIs & Services** → **Credentials** → your OAuth 2.0 Client (or create one → Web application)
3. Add **Authorized redirect URIs**:

   | Environment | URI |
   |-------------|-----|
   | Local | `http://localhost:3000/api/auth/callback/google` |
   | Production | `https://YOUR-APP.vercel.app/api/auth/callback/google` |

4. Copy **Client ID** and **Client Secret**

### 2.2 OAuth consent screen

If not done already: **APIs & Services** → **OAuth consent screen** → configure app name, support email, add your Google account as a test user (while in Testing mode).

---

## Part 3 — Local environment

Create `.env.local` in the project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Fill in all values. Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Test locally:

```bash
npm run dev
```

Open `http://localhost:3000` → Sign in with Google → create a post with an image.

---

## Part 4 — Deploy to Vercel

### 4.1 Connect repository

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import `Azfar-Tariq/social-media-app` from GitHub
3. Framework preset: **Next.js** (auto-detected)

### 4.2 Add environment variables

In Vercel project → **Settings** → **Environment Variables**, add **all** vars from `.env.local`:

| Variable | Environments |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development |
| `DATABASE_URL` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Production, Preview, Development |
| `GOOGLE_CLIENT_ID` | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Production, Preview, Development |
| `NEXTAUTH_URL` | **Production only** → `https://your-app.vercel.app` |

> Set `NEXTAUTH_URL` to your actual Vercel URL after the first deploy (you'll know the URL once deployed).

### 4.3 Deploy

Click **Deploy**. After deploy:

1. Copy your live URL (e.g. `https://chirpify.vercel.app`)
2. Update `NEXTAUTH_URL` in Vercel env vars to that URL
3. Add the production redirect URI in Google Cloud (see Part 2)
4. **Redeploy** (Deployments → ⋯ → Redeploy) so `NEXTAUTH_URL` takes effect

### 4.4 Verify production

- [ ] Home page loads
- [ ] Google sign-in works
- [ ] Can create a text post
- [ ] Can upload an image/video (check Supabase Storage → uploads bucket)
- [ ] Likes and comments work
- [ ] Post detail page works

---

## Part 5 — CV / portfolio

Add to your CV:

```
Chirpify — Social Media Web App
https://your-app.vercel.app
Next.js · TypeScript · Supabase (PostgreSQL + Storage) · NextAuth · Tailwind CSS
```

Talking points for interviews:
- **Why Supabase?** Single platform for relational data + file storage; free tier; no server management
- **Why Transaction pooler?** Serverless functions (Vercel) can't hold persistent DB connections
- **Auth flow:** NextAuth handles OAuth; user records stored in Postgres via Drizzle adapter
- **Media:** Uploaded server-side to Supabase Storage; public URLs served in posts

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing DATABASE_URL` | Add env var; use Transaction pooler URI (port 6543) |
| Google sign-in redirect error | Redirect URI must exactly match in Google Console |
| `NEXTAUTH_URL` mismatch | Must equal your deployed URL including `https://` |
| Image upload fails | Check `uploads` bucket exists and is public; verify `SUPABASE_SERVICE_ROLE_KEY` |
| Build fails on Vercel | Ensure all env vars are set for Production environment |
| `prepare` statement error | Already handled (`prepare: false` in db client) |

---

## Useful commands

```bash
npm run dev          # Local development
npm run build        # Production build check
npm run db:push      # Push schema changes to Supabase
npm run db:studio    # Visual DB browser (Drizzle Studio)
```
