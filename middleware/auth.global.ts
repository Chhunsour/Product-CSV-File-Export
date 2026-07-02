export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();
  const session = useSupabaseSession();
  const runtimeConfig = useRuntimeConfig();
  const devBypassAuth = runtimeConfig.public.devBypassAuth === true;

  if (devBypassAuth) {
    return;
  }

  if (to.path === "/login" || to.path === "/reset") {
    if (user.value || session.value) {
      return navigateTo("/");
    }
    return;
  }

  if (!user.value && !session.value) {
    return navigateTo("/login");
  }
});
