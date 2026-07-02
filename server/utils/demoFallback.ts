export const shouldUseDemoFallback = (error: any) => {
  const message = [
    error?.message,
    error?.statusMessage,
    error?.cause?.message,
    error?.details,
    error?.hint
  ]
    .filter(Boolean)
    .join(" ");

  return /fetch failed|failed to fetch|enotfound|eai_again|network/i.test(message);
};
