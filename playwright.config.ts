import { defineConfig, devices } from "@playwright/test"

// BASE_URL=https://bekal-three.vercel.app runs the same suite against production instead of the local preview.
const BASE = process.env.BASE_URL

export default defineConfig({
    testDir: "e2e",
    testMatch: "*.e2e.ts",
    timeout: 120_000,
    expect: { timeout: 45_000 },
    workers: 1, // the live registry's free indexer and public RPCs
    use: { baseURL: BASE ?? "http://localhost:4174", locale: "en-US", trace: "retain-on-failure" },
    webServer: BASE ? undefined : { command: "npm run build && npx vite preview --port 4174 --strictPort", url: "http://localhost:4174/wallet", reuseExistingServer: true, timeout: 120_000 },
    projects: [
        { name: "phone", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 780 } }, grepInvert: /@desktop/ },
        { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } }, grep: /@desktop/ }
    ]
})
