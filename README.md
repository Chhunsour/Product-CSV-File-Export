<div align="center">

# 📦 Product-CSV-File-Export
### Workspace Catalog & WordPress / WooCommerce Product CSV Export Pipeline

<p align="center">
  <sub>Developed by <strong>Seng Chhunsour</strong></sub>
</p>

[![Author: Seng Chhunsour](https://img.shields.io/badge/Author-Seng%20Chhunsour-FF5A1F?style=flat-square&logo=github&logoColor=white)](https://github.com/Chhunsour)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.12-00DC82?style=flat-square&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

</div>

---

A private, authenticated workspace catalog and automated e-commerce CSV pipeline built with **Nuxt 3, Supabase, Tailwind CSS, Sharp, and JSZip**. Supports transforming and generating WooCommerce/WordPress-compliant product CSVs with automated image optimization and archive packaging.

## ✨ Features

- 🔐 **Authenticated Workspace:** Protected routes, email authentication (magic link + password), and role-scoped admin controls.
- 🗃️ **Private Bucket Storage:** Secure file attachment storage in private Supabase buckets accessed via time-limited signed URLs.
- 📊 **WordPress / WooCommerce CSV Pipeline:** Built-in CLI and processing pipeline (`wp-csv-pipeline/cli.js`) to parse, validate, and export product catalogs into WooCommerce-ready CSV formats.
- 🖼️ **Image Optimization:** Automated image resizing and processing via `sharp` before packaging.
- 📝 **Markdown-Powered Documentation:** Safe markdown rendering with `markdown-it` avoiding unsafe raw HTML injection.

## 🛠️ Prerequisites

- **Node.js** 18+
- **Supabase project**

## 🚀 Setup & Installation

### 1. Supabase Configuration

1. Create a new Supabase project.
2. In **Authentication → Providers**, enable **Email** (magic link + password).
3. In **Authentication → Settings**, configure signup permissions.
4. In **Authentication → URL Configuration**, add `http://localhost:3000/reset` to **Redirect URLs**.
5. Open the **SQL Editor** and run `supabase/schema.sql`. This will:
   - Create tables and Row Level Security (RLS) policies.
   - Create the `workspace` private storage bucket.
   - Restrict access so authenticated users can only view their own directory.

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-anon-key
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start local Nuxt development server
npm run dev

# Run WordPress / WooCommerce CSV pipeline CLI
npm run wp:csv
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

## 📦 Scripts

```bash
npm run dev         # start Nuxt 3 development server
npm run build       # build production bundle
npm run preview     # preview production build locally
npm run wp:csv      # run the WooCommerce CSV export pipeline
```

---

## 👤 Author & Developer

**Developed by Seng Chhunsour**
- **GitHub:** [@Chhunsour](https://github.com/Chhunsour)
- **Repository:** [https://github.com/Chhunsour/Product-CSV-File-Export](https://github.com/Chhunsour/Product-CSV-File-Export)

---

## 📄 License

This project is open-source under the MIT License.
