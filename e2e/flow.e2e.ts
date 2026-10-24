// The whole path in a real browser, under the production CSP, against the live registry on Base Sepolia: a centre
// issues to a learner's wallet, the learner shows the record with their name hidden, a verifier checks it. Every test
// fails on any console error, and every page passes axe.
import fs from "node:fs"
import { test as base, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const test = base.extend<{ errors: string[] }>({
    errors: [async ({ page }, use) => {
        const errors: string[] = []
        page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
        page.on("pageerror", (e) => errors.push(e.message))
        await use(errors)
        expect(errors).toEqual([])
    }, { auto: true }]
})

async function axe(page: Page) {
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
}

async function issueTo(page: Page, code: string | null, course: string, opts: { own?: boolean } = {}) {
    await page.goto("/issuer")
    if (opts.own) await page.getByLabel(/My own centre/).check()
    await expect(page.locator("#recognition")).toHaveText(opts.own ? /^Not recognised/ : /^Recognised: Demo Learning Centre \(public test key\), Kuala Lumpur, Malaysia \(demo\)\. Vouched for by Bekal prototype root/)
    await page.getByLabel("What was learned").fill(course)
    await page.getByLabel("Level or result").fill("Completed")
    await page.getByLabel("Name").fill("Nur Aisyah")
    await page.getByLabel("Birth year").fill("2013")
    if (code) {
        await page.getByLabel("Learner's wallet code").fill(code)
        await page.getByRole("button", { name: "Use this" }).click()
        await expect(page.getByText(/^The learner's wallet/)).toBeVisible()
    }
    await page.getByRole("button", { name: "Sign and issue" }).click()
    await expect(page.getByRole("img", { name: "Learning record QR code" })).toBeVisible()
    await expect(page.locator("#cardText")).toContainText(course) // what a person reads on the printed card
    return (await page.locator("#credential").textContent())!
}

test("a centre issues to the learner's wallet; the learner shows it with the name hidden; a verifier sees it is genuine", async ({ page }) => {
    await page.goto("/wallet")
    await axe(page)
    const code = (await page.locator("#walletCode").textContent())!
    expect(code).toMatch(/^bekal-wallet:[A-Za-z0-9_-]+$/)

    const credential = await issueTo(page, code, "Mathematics, Grade 6")
    expect(credential).not.toContain("Nur Aisyah") // the issuer signs salted digests; the name travels only in a disclosure
    await axe(page)

    await page.goto(`/wallet#c=${credential}`)
    await expect(page.getByRole("status").first()).toHaveText("Saved: Mathematics, Grade 6.")
    await expect(page).toHaveURL(/\/wallet$/) // the record does not stay in the address bar
    await expect(page.getByText("from Demo Learning Centre (public test key)")).toBeVisible()
    await page.getByRole("button", { name: "Show" }).click()
    await page.getByLabel("Show my birth year").check()
    await page.getByRole("button", { name: "Make the code" }).click()
    await expect(page.getByRole("img", { name: "Presentation QR code" })).toBeVisible()
    await axe(page)
    const link = (await page.locator("#openVerify").getAttribute("href"))!
    expect(link).not.toContain("Nur%20Aisyah")
    await page.locator("#openVerify").click()

    const v = page.locator("#verdict")
    await expect(v.getByRole("heading")).toHaveText("✓ Genuine record from a recognised centre")
    await expect(v).toContainText("Mathematics, Grade 6 · Completed")
    await expect(v).toContainText("Born 2013")
    await expect(v).toContainText("1 of the learner's details kept private")
    await expect(v).not.toContainText("Nur Aisyah")
    await expect(v).toContainText("✓ Shown from the learner's own wallet, in the last 15 minutes")
    await expect(v).toContainText("✓ Not withdrawn by the centre")
    await expect(v.getByRole("link", { name: "on the registry" })).toHaveAttribute("href", /base-sepolia\.easscan\.org\/attestation\/view\/0x[0-9a-f]{64}$/)
    await axe(page)
})

test.describe(() => {
    test.use({ deviceScaleFactor: 2 }) // a camera photo, not a 1x screen grab
    test("the verifier reads a photo of the QR code the learner shows @desktop", async ({ page }, info) => {
    await page.goto("/wallet")
    const code = (await page.locator("#walletCode").textContent())!
    const credential = await issueTo(page, code, "English, Level B1")
    await page.goto(`/wallet#c=${credential}`)
    await page.getByRole("button", { name: "Show" }).first().click()
    await page.getByRole("button", { name: "Make the code" }).click()
    const shot = info.outputPath("presentation.png")
    await page.getByRole("img", { name: "Presentation QR code" }).screenshot({ path: shot })
    await page.goto("/verify")
    await page.locator("input[type=file]").setInputFiles(shot)
    await expect(page.locator("#verdict").getByRole("heading")).toHaveText("✓ Genuine record from a recognised centre")
    await expect(page.locator("#verdict")).toContainText("2 of the learner's details kept private")
    })
})

test("a record the centre withdrew on-chain is reported withdrawn", async ({ page }) => {
    await page.goto("/verify")
    await page.getByLabel("Presentation link or code").fill(fs.readFileSync("test/fixtures/revoked.txt", "utf8"))
    await page.getByRole("button", { name: "Use this" }).click()
    const v = page.locator("#verdict")
    await expect(v.getByRole("heading")).toHaveText("✗ Withdrawn by the centre")
    await expect(v).toContainText("✓ Signed by the centre's key")
    await expect(v).toContainText("✗ The centre has withdrawn this record")
    await axe(page)
})

test("a self-made centre's record is signed but not recognised; a forged one is not genuine; a wallet record without its wallet is refused", async ({ page }) => {
    const card = await issueTo(page, null, "Tailoring, Level 1", { own: true })
    await page.goto("/verify")
    await page.getByLabel("Presentation link or code").fill(card)
    await page.getByRole("button", { name: "Use this" }).click()
    await expect(page.locator("#verdict").getByRole("heading")).toHaveText("✗ Not from a recognised centre")
    await expect(page.locator("#verdict")).toContainText("✓ A printed card (not tied to a phone)")

    const [jwt, ...rest] = card.split("~")
    const [h, body, sig] = jwt.split(".")
    const claims = JSON.parse(Buffer.from(body, "base64url").toString())
    claims.achievement.course = "Medicine, Year 6"
    await page.getByLabel("Presentation link or code").fill([`${h}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.${sig}`, ...rest].join("~"))
    await page.getByRole("button", { name: "Use this" }).click()
    await expect(page.locator("#verdict").getByRole("heading")).toHaveText("✗ Not a genuine record")

    // A wallet-bound record copied out of the issuer page, shown without the wallet's proof.
    await page.goto("/wallet")
    const bound = await issueTo(page, (await page.locator("#walletCode").textContent())!, "Science, Grade 5")
    await page.goto("/verify")
    await page.getByLabel("Presentation link or code").fill(bound)
    await page.getByRole("button", { name: "Use this" }).click()
    await expect(page.locator("#verdict").getByRole("heading")).toHaveText("✗ Not shown from the learner's wallet")
})

test("the wallet opens and shows its records with no network, from the service worker @desktop", async ({ page, context }) => {
    await page.goto("/wallet")
    const code = (await page.locator("#walletCode").textContent())!
    const credential = await issueTo(page, code, "Arabic reading, Level 1")
    await page.goto(`/wallet#c=${credential}`)
    await expect(page.getByText("Arabic reading, Level 1", { exact: true })).toBeVisible()
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.reload() // controlled by the worker, which caches what it serves
    await expect(page.getByText("Arabic reading, Level 1", { exact: true })).toBeVisible()
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByText("Arabic reading, Level 1", { exact: true })).toBeVisible()
    await page.getByRole("button", { name: "Show" }).first().click()
    await page.getByRole("button", { name: "Make the code" }).click()
    await expect(page.getByRole("img", { name: "Presentation QR code" })).toBeVisible() // signed on the phone, offline
    await context.setOffline(false)
})

test("security headers: the CSP allows only this site, the registry and the public RPCs; no page can be framed @desktop", async ({ request }) => {
    for (const p of ["/", "/issuer", "/wallet", "/verify"]) {
        const h = (await request.get(p)).headers()
        expect(h["content-security-policy"], p).toContain("script-src 'self';")
        expect(h["content-security-policy"], p).toContain("frame-ancestors 'none'")
        expect(h["referrer-policy"], p).toBe("no-referrer") // a record in a link's fragment never leaks to another site
    }
})

test("the pages speak Malay, Indonesian, Burmese and Dari (right to left), remembered across visits, and say the translation needs review", async ({ page }) => {
    await page.goto("/wallet")
    const lang = page.getByRole("combobox", { name: "Language" })
    await lang.selectOption("ms")
    await expect(page.locator("h1")).toHaveText("Rekod pembelajaran saya")
    await expect(page.locator("html")).toHaveAttribute("lang", "ms")
    await expect(page.getByRole("note")).toContainText("belum disemak oleh penutur asli")
    await page.reload()
    await expect(page.locator("h1")).toHaveText("Rekod pembelajaran saya")
    await page.getByRole("combobox", { name: "Bahasa" }).selectOption("prs")
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
    await expect(page.locator("h1")).toHaveText("سوابق آموزشی من")
    await axe(page)
    await page.goto("/verify")
    await page.getByRole("combobox").first().selectOption("my")
    await expect(page.locator("h1")).toHaveText("သင်ယူမှုမှတ်တမ်းကို စစ်ဆေးရန်")
    await page.getByRole("combobox").first().selectOption("id")
    await page.getByLabel("Tautan atau kode tunjuk").fill(fs.readFileSync("test/fixtures/revoked.txt", "utf8"))
    await page.getByRole("button", { name: "Gunakan ini" }).click()
    await expect(page.locator("#verdict").getByRole("heading")).toHaveText("✗ Ditarik oleh pusat")
    await axe(page)
    await page.getByRole("combobox").first().selectOption("en")
})

test("a learner removes a record from the wallet; a centre backs up its key and restores it @desktop", async ({ page }) => {
    await page.goto("/wallet")
    const credential = await issueTo(page, (await page.locator("#walletCode").textContent())!, "Sewing, Level 2")
    await page.goto(`/wallet#c=${credential}`)
    await expect(page.getByText("Sewing, Level 2", { exact: true })).toBeVisible()
    page.once("dialog", (d) => d.accept())
    await page.getByRole("button", { name: "Remove: Sewing, Level 2" }).click()
    await expect(page.getByText("Sewing, Level 2", { exact: true })).toHaveCount(0)

    await page.goto("/issuer")
    await page.getByLabel(/My own centre/).check()
    await expect(page.locator("#recognition")).toHaveText(/^Not recognised/)
    const key = (await page.locator(".mono").first().textContent())!
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Back up this centre's key" }).click()])
    const file = await dl.path()
    await page.evaluate(() => new Promise((r) => { const q = indexedDB.deleteDatabase("bekal"); q.onsuccess = q.onerror = q.onblocked = r }))
    await page.reload()
    await page.getByLabel(/My own centre/).check()
    await expect(page.locator(".mono").first()).not.toHaveText(key) // a fresh key: the old one is gone from this browser
    await page.locator("input[type=file][accept='application/json']").setInputFiles(file)
    await expect(page.locator(".mono").first()).toHaveText(key)
})
