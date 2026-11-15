import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct connection; hosted databases (Neon) give the
    // app a pooled one in DATABASE_URL and the direct one in DIRECT_URL.
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
