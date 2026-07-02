export const buildPublicUrl = (supabaseUrl: string, bucket: string, path: string) => {
  const base = supabaseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
};
