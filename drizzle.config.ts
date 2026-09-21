import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://postgres:R@hu_3012@127.0.0.1:5432/Job_Portal",
  },
});
