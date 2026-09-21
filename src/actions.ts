import { createServerFn } from "@tanstack/react-start";
import { db } from "./server/db";
import { applications as applicationsTable, users, sessions } from "./server/schema";
import { eq, and } from "drizzle-orm";
import { Application } from "@/lib/applications";
import { hashPassword, generateSessionId, getSessionToken, setSessionToken, clearSessionToken } from "./server/auth";

export const getSessionUser = createServerFn({ method: "GET" })
  .handler(async () => {
    const token = getSessionToken();
    if (!token) return null;
    const res = await db.select().from(sessions).where(eq(sessions.id, token));
    if (res.length === 0 || res[0].expiresAt < new Date()) return null;
    const userRes = await db.select().from(users).where(eq(users.id, res[0].userId));
    return userRes.length > 0 ? userRes[0] : null;
  });

export const login = createServerFn({ method: "POST" })
  .validator((data: { username: string; passwordHash: string }) => data)
  .handler(async ({ data }) => {
    const res = await db.select().from(users).where(eq(users.username, data.username));
    if (res.length === 0 || res[0].passwordHash !== hashPassword(data.passwordHash)) {
      throw new Error("Invalid username or password");
    }
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await db.insert(sessions).values({ id: sessionId, userId: res[0].id, expiresAt });
    setSessionToken(sessionId, expiresAt);
    return { success: true };
  });

export const register = createServerFn({ method: "POST" })
  .validator((data: { username: string; passwordHash: string }) => data)
  .handler(async ({ data }) => {
    const existing = await db.select().from(users).where(eq(users.username, data.username));
    if (existing.length > 0) throw new Error("Username already taken");
    
    const userId = crypto.randomUUID();
    await db.insert(users).values({ id: userId, username: data.username, passwordHash: hashPassword(data.passwordHash) });
    
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({ id: sessionId, userId, expiresAt });
    setSessionToken(sessionId, expiresAt);
    return { success: true };
  });

export const logout = createServerFn({ method: "POST" })
  .handler(async () => {
    const token = getSessionToken();
    if (token) await db.delete(sessions).where(eq(sessions.id, token));
    clearSessionToken();
    return { success: true };
  });

export const getApplications = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getSessionUser();
    if (!user) throw new Error("Unauthorized");
    return (await db.select().from(applicationsTable).where(eq(applicationsTable.userId, user.id))) as Application[];
  });

export const addApplication = createServerFn({ method: "POST" })
  .validator((data: Application) => data)
  .handler(async ({ data }) => {
    const user = await getSessionUser();
    if (!user) throw new Error("Unauthorized");
    await db.insert(applicationsTable).values({ ...data, userId: user.id });
    return { success: true };
  });

export const updateApplication = createServerFn({ method: "POST" })
  .validator((data: { id: string; updates: Partial<Application> }) => data)
  .handler(async ({ data }) => {
    const user = await getSessionUser();
    if (!user) throw new Error("Unauthorized");
    await db.update(applicationsTable).set(data.updates).where(and(eq(applicationsTable.id, data.id), eq(applicationsTable.userId, user.id)));
    return { success: true };
  });

export const getApplication = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const user = await getSessionUser();
    if (!user) throw new Error("Unauthorized");
    const res = await db.select().from(applicationsTable).where(and(eq(applicationsTable.id, data.id), eq(applicationsTable.userId, user.id)));
    return (res.length > 0 ? res[0] : null) as Application | null;
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const user = await getSessionUser();
    if (!user) throw new Error("Unauthorized");
    await db.delete(applicationsTable).where(and(eq(applicationsTable.id, data.id), eq(applicationsTable.userId, user.id)));
    return { success: true };
  });
