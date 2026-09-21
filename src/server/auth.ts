import crypto from "node:crypto";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

const COOKIE_NAME = "job_portal_session";

export function hashPassword(password: string): string {
  const salt = "job_portal_salt_123";
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getSessionToken(): string | undefined {
  return getCookie(COOKIE_NAME);
}

export function setSessionToken(token: string, expiresAt: Date) {
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    expires: expiresAt,
    sameSite: "lax",
  });
}

export function clearSessionToken() {
  deleteCookie(COOKIE_NAME);
}
