<template>
  <div class="app-shell">

    <header v-if="showNav" class="nav-shell">
      <div class="nav-rail">
        <div class="nav-left">
          <NuxtLink to="/admin" class="nav-logo-link" aria-label="Dashboard">
            <svg
              class="nav-logo-svg"
              width="400"
              height="150"
              viewBox="0 0 400 150"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
            >
              <defs>
                <linearGradient id="denvorBlueGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#00c6ff;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#0072ff;stop-opacity:1" />
                </linearGradient>
              </defs>

              <g transform="translate(50, 10)">
                <circle cx="20" cy="40" r="6" fill="url(#denvorBlueGrad2)"/>
                <circle cx="80" cy="20" r="8" fill="url(#denvorBlueGrad2)"/>
                <circle cx="140" cy="50" r="5" fill="url(#denvorBlueGrad2)"/>
                <circle cx="190" cy="10" r="7" fill="url(#denvorBlueGrad2)"/>

                <line x1="20" y1="40" x2="80" y2="20" stroke="url(#denvorBlueGrad2)" stroke-width="3" opacity="0.5"/>
                <line x1="80" y1="20" x2="140" y2="50" stroke="url(#denvorBlueGrad2)" stroke-width="3" opacity="0.5"/>
                <line x1="140" y1="50" x2="190" y2="10" stroke="url(#denvorBlueGrad2)" stroke-width="3" opacity="0.5"/>
              </g>

              <text
                x="200"
                y="100"
                text-anchor="middle"
                font-family="'Montserrat', Verdana, sans-serif"
                font-weight="900"
                font-size="52"
                fill="url(#denvorBlueGrad2)"
                letter-spacing="1"
              >
                DENVOR
              </text>

              <g transform="translate(200, 130)">
                <line x1="-100" y1="-5" x2="-40" y2="-5" stroke="url(#denvorBlueGrad2)" stroke-width="2"/>
                <text
                  x="0"
                  y="0"
                  text-anchor="middle"
                  font-family="'Montserrat', Verdana, sans-serif"
                  font-weight="400"
                  font-size="14"
                  fill="#0072ff"
                  letter-spacing="4"
                >
                  DIGITAL
                </text>
                <line x1="40" y1="-5" x2="100" y2="-5" stroke="url(#denvorBlueGrad2)" stroke-width="2"/>
              </g>
            </svg>
          </NuxtLink>
        </div>

        <div class="nav-center">
          <div class="nav-center-group">
            <div class="nav-group">
              <button
                type="button"
                class="nav-tab nav-tab-disabled"
                disabled
                aria-disabled="true"
                title="Home is locked"
              >
                <span class="nav-tab-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 11l9-7 9 7"></path>
                    <path d="M5 10v10h14V10"></path>
                  </svg>
                </span>
                <span>{{ t("nav.home") }}</span>
              </button>
              <NuxtLink
                to="/admin"
                :class="['nav-tab', 'nav-tab-commerce', isCommerce && 'nav-tab-active']"
              >
                <span class="nav-tab-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 6h16"></path>
                    <path d="M4 10h10"></path>
                    <path d="M4 14h16"></path>
                    <path d="M4 18h10"></path>
                  </svg>
                </span>
                <span>{{ t("nav.commerce") }}</span>
              </NuxtLink>
            </div>
            <div class="nav-group">
              <NuxtLink
                to="/media/images"
                :class="['nav-tab', isImages && 'nav-tab-active']"
              >
                <span class="nav-tab-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                    <path d="M7 15l3-3 3 3 3-4 3 4"></path>
                  </svg>
                </span>
                <span>{{ t("nav.images") }}</span>
              </NuxtLink>
              <NuxtLink
                to="/media/videos"
                :class="['nav-tab', isVideos && 'nav-tab-active']"
              >
                <span class="nav-tab-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="14" height="14" rx="2"></rect>
                    <path d="M17 9l4-2v10l-4-2z"></path>
                  </svg>
                </span>
                <span>{{ t("nav.videos") }}</span>
              </NuxtLink>
              <NuxtLink
                to="/notes"
                :class="['nav-tab', isNotes && 'nav-tab-active']"
              >
                <span class="nav-tab-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16v16H4z"></path>
                    <path d="M8 8h8"></path>
                    <path d="M8 12h8"></path>
                    <path d="M8 16h5"></path>
                  </svg>
                </span>
                <span>{{ t("nav.notes") }}</span>
              </NuxtLink>
              <NuxtLink
                to="/blogs"
                :class="['nav-tab', isBlogs && 'nav-tab-active']"
              >
                <span class="nav-tab-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 5h16v14H4z"></path>
                    <path d="M8 9h8"></path>
                    <path d="M8 13h6"></path>
                    <path d="M8 17h8"></path>
                  </svg>
                </span>
                <span>{{ t("nav.blogs") }}</span>
              </NuxtLink>
            </div>
            <span class="nav-divider" aria-hidden="true"></span>
          <NuxtLink to="/admin/new" class="nav-action">
            <span class="nav-action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
            </span>
            <span>{{ t("nav.new_item") }}</span>
            <span class="nav-action-badge">HOT</span>
          </NuxtLink>
          </div>
        </div>

        <div class="nav-right">
          <button
            type="button"
            class="btn-ghost text-[11px] px-3 py-1.5"
            @click="toggleLocale"
          >
            {{ locale === "km" ? t("nav.lang_toggle_en") : t("nav.lang_toggle_km") }}
          </button>
          <button
            type="button"
            class="btn-ghost text-[11px] px-3 py-1.5"
            :aria-pressed="theme === 'light'"
            @click="toggleTheme"
          >
            {{ theme === "light" ? t("nav.dark_mode") : t("nav.light_mode") }}
          </button>
          <button
            v-if="!devBypassAuth"
            class="btn-ghost text-[11px] px-3 py-1.5"
            type="button"
            @click="signOut"
          >
            {{ t("nav.sign_out") }}
          </button>
        </div>
      </div>
      <div class="header-glow" aria-hidden="true"></div>
    </header>

    <main :class="['w-full px-2 py-4 fade-up', isCompact && 'main-shell']">
      <slot />
    </main>
    <FloatingTodo />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import FloatingTodo from "~/components/FloatingTodo.vue";

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const theme = useState<"dark" | "light">("theme", () => "dark");
const { locale, t, setLocale, initLocale } = useLocale();

const devBypassAuth = computed(() => runtimeConfig.public.devBypassAuth === true);
const showNav = computed(() => devBypassAuth.value || route.path !== "/login");
const isCompact = computed(() => ["/", "/admin", "/media/images", "/media/videos", "/notes", "/blogs"].includes(route.path));
const isHome = computed(() => route.path === "/");
const isCommerce = computed(() => route.path.startsWith("/admin"));
const isImages = computed(() => route.path.startsWith("/media/images"));
const isVideos = computed(() => route.path.startsWith("/media/videos"));
const isNotes = computed(() => route.path.startsWith("/notes"));
const isBlogs = computed(() => route.path.startsWith("/blogs"));

const signOut = async () => {
  await supabase.auth.signOut();
  if (route.path !== "/login") {
    await navigateTo("/login");
  }
};

const applyTheme = (value: "dark" | "light") => {
  if (!process.client) return;
  const root = document.documentElement;
  root.classList.toggle("theme-light", value === "light");
  root.classList.toggle("theme-dark", value === "dark");
};

const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
};

const toggleLocale = () => {
  setLocale(locale.value === "en" ? "km" : "en");
};

onMounted(() => {
  if (!process.client) return;
  const saved = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const nextTheme = saved === "light" || saved === "dark" ? (saved as "light" | "dark") : prefersLight ? "light" : "dark";
  theme.value = nextTheme;
  applyTheme(nextTheme);
  initLocale();
});

watch(theme, (value) => {
  if (!process.client) return;
  localStorage.setItem("theme", value);
  applyTheme(value);
});
</script>
