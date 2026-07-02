<template>
  <section class="page-shell page-auth page-login">
    <div class="page-surface">
      <div class="panel mx-auto flex w-full max-w-md flex-col gap-6 p-8 fade-up">
        <div>
          <h1 class="text-2xl font-semibold text-slate-100">{{ t("login.sign_in") }}</h1>
          <p class="mt-2 text-sm text-slate-400">
          {{ t("login.magic_link") }}
          </p>
        </div>

        <div v-if="demoAccessEnabled" class="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4">
          <p class="text-sm font-semibold text-slate-100">Need to get in now?</p>
          <p class="mt-1 text-xs leading-5 text-slate-300">
            Use demo access to open the dashboard with full local owner access.
          </p>
          <button
            type="button"
            class="btn-primary mt-3 w-full"
            @click="enterDemoDashboard"
          >
            Enter demo dashboard
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="sendMagicLink">
          <div>
            <label class="text-sm font-medium text-slate-300" for="email">{{ t("login.email") }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-2 w-full input-shell"
              :placeholder="t('login.email_placeholder')"
            />
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? t("login.sending") : t("login.send_magic") }}
          </button>
        </form>

        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span class="h-px flex-1 bg-slate-700/60"></span>
          {{ t("login.or") }}
          <span class="h-px flex-1 bg-slate-700/60"></span>
        </div>

        <form class="space-y-4" @submit.prevent="signInWithPassword">
          <div>
            <label class="text-sm font-medium text-slate-300" for="password">{{ t("login.password") }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="mt-2 w-full input-shell"
              :placeholder="t('login.password_placeholder')"
            />
          </div>

          <button
            type="submit"
            class="btn-ghost w-full"
            :disabled="passwordLoading"
          >
            {{ passwordLoading ? t("login.signing_in") : t("login.sign_in_password") }}
          </button>
        </form>

        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span class="h-px flex-1 bg-slate-700/60"></span>
          {{ t("login.forgot_password") }}
          <span class="h-px flex-1 bg-slate-700/60"></span>
        </div>

        <form class="space-y-4" @submit.prevent="sendPasswordReset">
          <p class="text-xs text-slate-400">
            {{ t("login.reset_copy") }}
          </p>
          <button
            type="submit"
            class="btn-ghost w-full"
            :disabled="resetLoading"
          >
            {{ resetLoading ? t("login.sending") : t("login.send_reset") }}
          </button>
        </form>

        <div v-if="message" class="alert alert-info">
          {{ message }}
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div v-if="passwordError" class="alert alert-error">
          {{ passwordError }}
        </div>

        <div v-if="resetMessage" class="alert alert-success">
          {{ resetMessage }}
        </div>

        <div v-if="resetError" class="alert alert-error">
          {{ resetError }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const { t } = useLocale();
const runtimeConfig = useRuntimeConfig();
const demoAccessEnabled = computed(() => runtimeConfig.public.devBypassAuth === true);
const demoOwnerConfigured = computed(() => Boolean(runtimeConfig.public.devOwnerId));
const email = ref("");
const password = ref("");
const loading = ref(false);
const passwordLoading = ref(false);
const resetLoading = ref(false);
const message = ref("");
const errorMessage = ref("");
const passwordError = ref("");
const resetMessage = ref("");
const resetError = ref("");

const clearMessages = () => {
  message.value = "";
  errorMessage.value = "";
  passwordError.value = "";
  resetMessage.value = "";
  resetError.value = "";
};

const enterDemoDashboard = async () => {
  clearMessages();

  if (!demoOwnerConfigured.value) {
    passwordError.value = "Demo access needs DEV_OWNER_ID in .env, then restart the dev server.";
    return;
  }

  await navigateTo("/admin");
};

const sendMagicLink = async () => {
  clearMessages();
  loading.value = true;

  try {
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: { emailRedirectTo: redirectTo }
    });

    if (error) {
      throw error;
    }

    message.value = t("login.magic_sent");
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || t("login.magic_error");
  } finally {
    loading.value = false;
  }
};

const signInWithPassword = async () => {
  clearMessages();
  passwordLoading.value = true;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    if (error) {
      throw error;
    }

    await navigateTo("/");
  } catch (error) {
    const err = error as Error;
    passwordError.value = err.message || t("login.password_error");
  } finally {
    passwordLoading.value = false;
  }
};

const sendPasswordReset = async () => {
  clearMessages();

  if (!email.value) {
    resetError.value = t("login.enter_email_first");
    return;
  }

  resetLoading.value = true;
  try {
    const redirectTo = `${window.location.origin}/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo
    });

    if (error) {
      throw error;
    }

    resetMessage.value = t("login.reset_sent");
  } catch (error) {
    const err = error as Error;
    resetError.value = err.message || t("login.reset_error");
  } finally {
    resetLoading.value = false;
  }
};
</script>
