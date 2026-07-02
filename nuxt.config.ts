import { fileURLToPath } from "node:url";

const appManifestStub = fileURLToPath(new URL("./app-manifest.mjs", import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: "2026-02-07",
  devtools: { enabled: true },
  alias: {
    "#app-manifest": appManifestStub
  },
  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/tailwind.css"],
  vite: {
    resolve: {
      alias: {
        "#app-manifest": appManifestStub
      }
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  nitro: {},
  runtimeConfig: {
    supabase: {
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    },
    public: {
      siteBaseUrl: process.env.SITE_BASE_URL || "http://localhost:3000",
      devBypassAuth: process.env.DEV_BYPASS_AUTH === "true",
      devOwnerId: process.env.DEV_OWNER_ID || "",
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY
      }
    }
  },
  app: {
    head: {
      title: "Denvor Digital",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" }
      ]
    }
  }
});
