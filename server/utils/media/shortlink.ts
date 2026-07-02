import { randomBytes } from "node:crypto";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const randomCode = (length = 7) => {
  const bytes = randomBytes(length);
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += alphabet[bytes[i] % alphabet.length];
  }
  return output;
};

export const generateShortCode = (length = 7) => {
  return randomCode(length);
};

export const buildShortUrl = (baseUrl: string, code: string) => {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return `${trimmed}/m/${code}`;
};
