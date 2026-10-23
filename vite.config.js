import fs from "node:fs"
import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"

// The preview serves vercel.json's headers and clean URLs, so the e2e suite runs under the CSP production sends.
const vercel = JSON.parse(fs.readFileSync(new URL("./vercel.json", import.meta.url), "utf8"))
const pages = ["issuer", "wallet", "verify"]
const asProduction = {
    name: "as-production",
    configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
            for (const h of vercel.headers[0].headers) res.setHeader(h.key, h.value)
            const path = req.url.split(/[?#]/)[0]
            if (pages.includes(path.slice(1))) req.url = req.url.replace(path, `${path}.html`)
            next()
        })
    }
}

export default defineConfig({
    plugins: [svelte(), asProduction],
    build: { rollupOptions: { input: { index: "index.html", issuer: "issuer.html", wallet: "wallet.html", verify: "verify.html" } } }
})
