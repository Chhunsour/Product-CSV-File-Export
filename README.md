# Workspace Catalog (Nuxt 3 + Supabase)

A private, authenticated workspace catalog built with Nuxt 3, Supabase, and Tailwind CSS.

## Prerequisites
- Node.js 18+
- A Supabase project

## 1) Supabase setup
1. Create a new Supabase project.
2. In **Authentication → Providers**, enable **Email** (magic link + password).
3. In **Authentication → Settings**, disable public signups.
4. Create a user in **Authentication → Users** (set a password if you want to use password login).
5. In **Authentication → URL Configuration**, add `http://localhost:3000/reset` to **Redirect URLs** (for password resets).
5. Open **SQL Editor** and run the SQL in `supabase/schema.sql`.

This will:
- Create tables and RLS policies
- Create the `workspace` private storage bucket
- Set storage policies so users can only access their own folder

## 2) Configure environment variables
Copy `.env.example` to `.env` and fill in your Supabase details:

```
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-anon-key
```

Find these in **Project Settings → API**.

## 3) Install dependencies
```
npm install
```

## 4) Run the app
```
npm run dev
```

The app will be available at `http://localhost:3000`.

## Usage
- Visit `/login` and send yourself a magic link, sign in with password, or send a password reset link.
- After logging in, you will be redirected to `/`.
- Manage items and attachments in `/admin`.

## Notes
- All routes are protected by auth middleware except `/login`.
- File attachments are stored in the private `workspace` bucket and accessed with signed URLs.
- Markdown is rendered with `markdown-it` and `html: false` to avoid raw HTML.
