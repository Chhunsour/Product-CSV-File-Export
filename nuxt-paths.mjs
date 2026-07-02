import { joinRelativeURL } from "ufo";

function getAppConfig() {
  return {
    baseURL: "/",
    buildAssetsDir: "/_nuxt/",
    cdnURL: ""
  };
}

export const baseURL = () => getAppConfig().baseURL;
export const buildAssetsDir = () => getAppConfig().buildAssetsDir;
export const buildAssetsURL = (...path) => joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
export const publicAssetsURL = (...path) => {
  const appConfig = getAppConfig();
  const publicBase = appConfig.cdnURL || appConfig.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
};

if (typeof window !== "undefined") {
  globalThis.__buildAssetsURL = buildAssetsURL;
  globalThis.__publicAssetsURL = publicAssetsURL;
}
