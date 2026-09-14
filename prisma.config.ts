import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma CLI (migrate, db seed, studio, ...) uses the DIRECT (unpooled) Neon
// connection string, since Migrate needs a session-based connection rather
// than the pgbouncer-pooled one used by the app at runtime (see src/lib/db.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
