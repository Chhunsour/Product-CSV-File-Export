<template>
  <section class="page-shell page-auth page-reset">
    <div class="page-surface">
      <div class="panel mx-auto flex w-full max-w-md flex-col gap-6 p-8 fade-up">
        <div>
          <h1 class="text-2xl font-semibold text-slate-100">Reset password</h1>
          <p class="mt-2 text-sm text-slate-400">
            Enter a new password for your account.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="handleReset">
          <div>
            <label class="text-sm font-medium text-slate-300" for="new-password">New password</label>
            <input
              id="new-password"
              v-model="password"
              type="password"
              required
              class="mt-2 w-full input-shell"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-slate-300" for="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              class="mt-2 w-full input-shell"
            />
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? "Updating..." : "Update password" }}
          </button>
        </form>

        <div v-if="message" class="alert alert-success">
          {{ message }}
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <p class="text-xs text-slate-400">
          If this page says you are not authenticated, open the reset link from your email again.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const session = useSupabaseSession();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const message = ref("");
const errorMessage = ref("");

const handleReset = async () => {
  message.value = "";
  errorMessage.value = "";

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  if (!session.value) {
    errorMessage.value = "No recovery session found. Open the reset link from your email.";
    return;
  }

  loading.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value
    });

    if (error) {
      throw error;
    }

    message.value = "Password updated. You can sign in now.";
    await navigateTo("/login");
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || "Failed to update password.";
  } finally {
    loading.value = false;
  }
};
</script>
