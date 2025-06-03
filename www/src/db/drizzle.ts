import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
const client = createClient({ 
  url: "https://app.turso.tech/manfrexistence/databases/better-auth",
  authToken: process.env.DATABASE_AUTH_TOKEN
});
export const db = drizzle({ client });
