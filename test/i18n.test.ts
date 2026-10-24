import { describe, expect, it, vi } from "vitest"

// The dictionaries load without a browser: no localStorage, no document.
vi.stubGlobal("window", undefined)
const { LANGS, keysOf, t, ui } = await import("../src/lib/i18n.svelte.ts")

describe("translations", () => {
    const en = keysOf("en").sort()
    it.each(Object.keys(LANGS).filter((l) => l !== "en"))("%s has every English string and the same {placeholders}", (lang) => {
        expect(keysOf(lang as never).sort()).toEqual(en)
        for (const k of en) {
            ui.lang = "en"
            const want = (t(k).match(/\{\w+\}/g) ?? []).sort()
            ui.lang = lang as never
            // t() fills placeholders, so compare the raw strings through a key-only render
            const raw = t(k, Object.fromEntries(want.map((p) => [p.slice(1, -1), p])))
            for (const p of want) expect(raw, `${lang}.${k}`).toContain(p)
            expect(raw.trim(), `${lang}.${k}`).not.toBe("")
        }
        ui.lang = "en"
    })
    it("fills placeholders and falls back to English for a missing key", () => {
        ui.lang = "ms"
        expect(t("wSaved", { x: "Matematik" })).toBe("Disimpan: Matematik.")
        expect(t("no-such-key")).toBe("no-such-key")
        ui.lang = "en"
    })
})
