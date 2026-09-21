import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const applications = pgTable("applications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  date: text("date").notNull(),
  platform: text("platform").$type<"LinkedIn" | "Naukri" | "Indeed" | "Company site" | "Referral">().notNull(),
  status: text("status").$type<"Applied" | "Screening" | "Interview" | "Offer">().notNull(),
  initials: text("initials").notNull(),
  source: text("source").notNull(),
  notes: text("notes").notNull(),
});

