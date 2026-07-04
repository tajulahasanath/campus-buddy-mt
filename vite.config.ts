// @lovable.dev/vite-tanstack-config already includes tanstackStart, viteReact, tailwindcss,
// tsConfigPaths, nitro (build-only), componentTagger (dev-only), VITE_* env injection,
// @ path alias, React/TanStack dedupe, error logger plugins, and sandbox detection.
// Do NOT add those plugins manually — the app will break with duplicates.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Pin the Nitro preset to `vercel` for external CI (Vercel serverless functions).
// Inside a Lovable build the wrapper forces the Cloudflare preset regardless,
// so this override only takes effect when building on Vercel.
export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (SSR error wrapper).
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
});
