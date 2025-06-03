import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/drizzle',
  schema: './src/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: "libsql://friday-manfrexistence.aws-ap-northeast-1.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
