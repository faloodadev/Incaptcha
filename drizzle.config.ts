import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_KjeMG5caJZA4@ep-plain-sunset-a4jzxovu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
