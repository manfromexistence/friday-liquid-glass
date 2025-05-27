import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

// import { getDbConnectionString } from "@/lib/db";
// import "dotenv/config";
// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   out: "./src/lib/db/migrations",
//   schema: "./src/lib/db/schema.ts",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: getDbConnectionString(),
//   },
// });
