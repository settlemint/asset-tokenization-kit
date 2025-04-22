import { treaty } from "@elysiajs/eden";
import type { Api } from "./index";

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
};

export const apiClient = treaty<Api>(getApiUrl());
