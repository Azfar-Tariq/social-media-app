# Chirpify — Social Media Platform

A full-stack social media application built with **Next.js 14 (App Router)**, **TypeScript**, **Drizzle ORM**, and **Supabase (PostgreSQL & Storage)**.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** PostgreSQL (Hosted on [Supabase](https://supabase.com/))
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) + `drizzle-kit` + `@auth/drizzle-adapter`
- **Authentication:** [NextAuth.js v4](https://next-auth.js.org/) (Google OAuth + Email/Password Credentials)
- **File Storage:** [Supabase Storage](https://supabase.com/storage) (`post-media` bucket)
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix UI), [Framer Motion](https://www.framer.com/motion/) & [Lucide Icons](https://lucide.dev/)

---

## ✨ Features

- 🔐 **Authentication:** Google OAuth & Email/Password login/signup with NextAuth & JWT sessions.
- 📝 **Post Creation:** Create and delete posts with optional image or video attachments.
- 🖼️ **Media Uploads:** Upload media files directly to Supabase Storage with client-side preview.
- ❤️ **Interactions:** Like/unlike posts and comment on posts with dynamic counters.
- 👥 **User Relationships:** Follow/unfollow users, view follower/following counts.
- 🔔 **Notifications:** Notifications feed for likes, comments, and new followers.
- 👤 **Profiles:** User profiles displaying bio, avatar, user posts, and follower metrics.
- 🎨 **Responsive UI:** Dark/Light theme interface with dynamic micro-animations.

---

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router (pages & API routes)
│   ├── (auth)/           # Login & Signup pages
│   ├── api/              # API Endpoints (auth, posts, comments, likes, follows, notifications, users)
│   ├── posts/            # Single post detailed view
│   ├── profile/          # User profile pages
│   └── page.tsx          # Main home feed page
├── components/           # UI Components (Post, CommentForm, MediaUpload, Navigation, UI primitives)
├── db/                   # Database schema & Drizzle client initialization
│   ├── index.ts          # Postgres connection & Drizzle instance
│   └── schema.ts         # Relational database tables (users, posts, comments, likes, follows, notifications)
└── lib/                  # Helper utilities (authOptions, password hashing, Supabase client)
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [Supabase](https://supabase.com/) project (PostgreSQL database & Storage bucket)
- Google OAuth Credentials (optional, for Google Sign-In)

### 2. Environment Variables

Create a `.env.local` file in the root directory (refer to `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Installation & Database Migration

```bash
# Install dependencies
npm install

# Push database schema to Supabase
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm run db:push` | Pushes Drizzle schema changes to Supabase PostgreSQL |
| `npm run db:studio` | Launches Drizzle Studio GUI for database inspection |
| `npm run clean` | Clears local `.next` build cache |

