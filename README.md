# Chirpify

A social media web app built with Next.js — post updates, share images/videos, like and comment.

**Live demo:** _(add your Vercel URL after deploy)_

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Supabase** — PostgreSQL database + file storage
- **NextAuth** — Google OAuth
- **Tailwind CSS** + shadcn/ui + Framer Motion
- **Drizzle ORM** — type-safe database queries
- **Vercel** — hosting

## Quick start

See **[SETUP.md](./SETUP.md)** for the full deployment checklist (Supabase, Google OAuth, Vercel).

```bash
cp .env.example .env.local   # fill in your keys
npm install
npm run db:push              # create tables in Supabase
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to Supabase |
| `npm run db:studio` | Open Drizzle Studio |
