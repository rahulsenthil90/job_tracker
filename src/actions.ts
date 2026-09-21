import { createServerFn } from "@tanstack/react-start";
import { db } from "./server/db";
import { applications as applicationsTable, users, sessions } from "./server/schema";
import { eq, and } from "drizzle-orm";
import { Application } from "@/lib/applications";
import { hashPassword, generateSessionId, getSessionToken, setSessionToken, clearSessionToken } from "./server/auth";
import { GoogleGenAI } from "@google/genai";
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

export const extractWithAI = createServerFn({ method: "POST" })
  .validator((data: { text: string }) => data)
  .handler(async ({ data }) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let response;
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `You are a helpful assistant. Extract job applications from the following text. 
Return ONLY a valid JSON array where each object has these exact keys: "company" (string), "role" (string), "date" (string, YYYY-MM-DD), and "platform" (string, one of: "LinkedIn", "Naukri", "Indeed", "Company site", "Referral").
Do not include markdown blocks like \`\`\`json. Return just the raw JSON array. If the date is relative (like "22h ago"), calculate it relative to today (${new Date().toISOString().split('T')[0]}).

Text to extract:
${data.text}`,
        });
        break; // Success
      } catch (e: any) {
        if (e.message?.includes('503') || e.status === 'UNAVAILABLE' || e.message?.includes('UNAVAILABLE')) {
          retries--;
          if (retries === 0) throw new Error("Google AI servers are currently too busy (High Demand). Please wait a few seconds and try again.");
          await new Promise(r => setTimeout(r, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw e;
        }
      }
    }
    
    try {
      // Clean up markdown if the AI includes it anyway
      let text = response.text || "[]";
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(text);
      return { success: true, data: parsed as Partial<Application>[] };
    } catch (e) {
      throw new Error("Failed to parse AI response: " + (response.text || "No response text"));
    }
  });
