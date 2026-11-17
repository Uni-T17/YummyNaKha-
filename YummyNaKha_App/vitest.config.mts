// Vitest config for the unit tests in tests/ (test plan TC7, TC9).
// Run without installing anything: npx vitest@3.2.4 run
// A plain object (no import from "vitest"), so the app's dependencies and build stay unchanged.
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./", import.meta.url));

const config = {
  resolve: {
    alias: {
      // The real package throws outside a React Server Component; tests run plain Node.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
      "@": root,
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // describe / it / expect without importing "vitest" (it isn't a project dependency).
    globals: true,
  },
};

export default config;
