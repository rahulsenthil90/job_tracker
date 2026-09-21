import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = "postgres://postgres:R@hu_3012@127.0.0.1:5432/Job_Portal";
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
