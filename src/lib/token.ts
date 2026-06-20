import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";

export const saveToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { sameSite: "strict" });
};

export const getToken = (): string | null =>
  Cookies.get(TOKEN_KEY) ?? null;

export const clearToken = (): void =>
  Cookies.remove(TOKEN_KEY);