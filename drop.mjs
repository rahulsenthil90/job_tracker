import postgres from 'postgres';
const sql = postgres('postgres://postgres:R@hu_3012@127.0.0.1:5432/Job_Portal');
await sql`DROP TABLE IF EXISTS applications;`;
await sql.end();
