import { applications as mockData } from "./src/lib/applications";
import { db } from "./src/server/db";
import { applications } from "./src/server/schema";
import { count } from "drizzle-orm";
import postgres from "postgres";

async function run() {
  const connectionString = "postgres://postgres:R@hu_3012@127.0.0.1:5432/Job_Portal";
  const sql = postgres(connectionString);

  // We rely on drizzle-kit push to create the table first.
  
  try {
    const [{ value }] = await db.select({ value: count() }).from(applications);
    if (value === 0) {
      console.log("Seeding database with mock data...");
      await db.insert(applications).values(mockData);
      console.log("Seeded successfully.");
    } else {
      console.log("Database already has data. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
