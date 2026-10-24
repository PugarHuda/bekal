<script lang="ts">
    // The learner's wallet: a key made on this phone, the records it holds, and presentations the learner shapes
    // themselves. Works offline once opened (sw.js). Nothing leaves the phone except what the learner chooses to show.
    import { onMount } from "svelte"
    import config from "../config.json"
    import { decode, jwkOf, present, type Learner, type Learning } from "../lib/credential.ts"
    import { addressOfDid, b64u, newKey } from "../lib/crypto.ts"
    import { payloadOf } from "../lib/qr.ts"
    import { get, keyFor, set } from "../lib/store.ts"
    import { t } from "../lib/i18n.svelte.ts"
    import Header from "../components/Header.svelte"
    import Qr from "../components/Qr.svelte"
    import Scan from "../components/Scan.svelte"

    type Held = { credential: string; jti: string; issuer: string; achievement: Learning; learner: Learner; bound: boolean; added: string }
    let key = $state("")
    let records = $state<Held[]>([])
    let code = $state("")
    let showing = $state<{ r: Held; name: boolean; birthYear: boolean; link?: string } | null>(null)
    let msg = $state("")
    let names = $state<Record<string, string>>({})
    const codeOf = (k: string) => `bekal-wallet:${b64u(new TextEncoder().encode(JSON.stringify(jwkOf(k))))}`
    const save = () => set("records", $state.snapshot(records))

    async function keep(credential: string) {
        const { payload } = await decode(credential)
        if (records.some((r) => r.jti === payload.jti)) return void (msg = t("wAlready"))
        const held: Held = { credential, jti: payload.jti, issuer: addressOfDid(payload.iss), achievement: payload.achievement, learner: payload.learner ?? {}, bound: !!payload.cnf, added: new Date().toISOString().slice(0, 10) }
        records = [held, ...records]
        await save()
        msg = t("wSaved", { x: held.achievement.course })
        lookup()
    }

    async function lookup() {
        if (!navigator.onLine) return
        const { registry } = await import("../lib/registry.ts")
        for (const a of new Set(records.map((r) => r.issuer))) {
            if (names[a]) continue
            registry.recognition(a).then((r) => (names = { ...names, [a]: r.recognised ? r.name : t("wNotOnRegistry") })).catch(() => {})
        }
    }

    onMount(async () => {
        key = await keyFor("holderKey", newKey)
        code = codeOf(key)
        records = (await get<Held[]>("records")) ?? []
        const incoming = payloadOf(location.hash, "c")
        if (incoming) {
            history.replaceState(null, "", location.pathname) // the record does not stay in the address bar
            await keep(incoming).catch((e) => (msg = `${t("wNotRecord")} (${(e as Error).message})`))
        }
        lookup()
        if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {})
    })

    async function show() {
        if (!showing) return
        try {
            const p = await present({ chainId: config.chainId, credential: showing.r.credential, reveal: { name: showing.name, birthYear: showing.birthYear }, holderKey: showing.r.bound ? key : undefined })
            showing = { ...showing, link: `${location.origin}/verify#p=${p}` }
        } catch (e) {
            msg = (e as Error).message
        }
    }

    async function remove(r: Held) {
        if (!confirm(t("wRemoveAsk"))) return
        records = records.filter((x) => x.jti !== r.jti)
        await save()
        msg = t("wRemoved")
    }

    function backup() {
        const blob = new Blob([JSON.stringify({ bekal: 1, holderKey: key, records: $state.snapshot(records) })], { type: "application/json" })
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `bekal-wallet-${new Date().toISOString().slice(0, 10)}.json` })
        a.click()
        URL.revokeObjectURL(a.href)
    }
    async function restore(e: Event) {
        const f = (e.target as HTMLInputElement).files?.[0]
        if (!f) return
        try {
            const j = JSON.parse(await f.text())
            if (j.bekal !== 1 || !j.holderKey) throw new Error("not a Bekal backup")
            if (!confirm(t("wRestoreAsk"))) return
            key = j.holderKey
            await set("holderKey", key)
            const known = new Set(records.map((r) => r.jti))
            records = [...records, ...(j.records as Held[]).filter((r) => !known.has(r.jti))]
            await save()
            code = codeOf(key)
            msg = t("wRestored", { n: j.records.length })
        } catch (err) {
            msg = (err as Error).message
        }
    }
</script>

<Header page="wallet" />
<main>
    <h1>{t("wTitle")}</h1>
    <p class="lead">{t("wLead")}</p>
    <p class="msg" role="status">{msg}</p>

    {#if showing}
        <section class="card" aria-labelledby="showH">
            <h2 id="showH">{t("wShowTitle")}: {showing.r.achievement.course}</h2>
            <p class="fine">{t("wAlways")}</p>
            {#if showing.r.learner.name}<label class="check"><input type="checkbox" bind:checked={showing.name} onchange={() => showing && (showing.link = undefined)} />{t("wShowName")}</label>{/if}
            {#if showing.r.learner.birthYear}<label class="check"><input type="checkbox" bind:checked={showing.birthYear} onchange={() => showing && (showing.link = undefined)} />{t("wShowBirth")}</label>{/if}
            {#if showing.link}
                <Qr text={showing.link} label={t("presentationQr")} />
                <p class="fine">{t("wValid")}{showing.r.bound ? t("wOnlyHere") : ""}. {t("wScanHint")}</p>
                <div class="actions"><button type="button" class="ghost" onclick={() => navigator.clipboard?.writeText(showing!.link!)}>{t("wCopy")}</button><a class="btn ghost" href={showing.link} id="openVerify">{t("wOpen")}</a></div>
            {:else}
                <div class="actions"><button type="button" onclick={show}>{t("wMake")}</button></div>
            {/if}
            <div class="actions"><button type="button" class="ghost" onclick={() => (showing = null)}>{t("wBack")}</button></div>
        </section>
    {:else}
        <section class="card" aria-labelledby="recH">
            <h2 id="recH">{t("wRecords")} ({records.length})</h2>
            {#if records.length}
                <ul class="list">
                    {#each records as r (r.jti)}
                        <li><span><b>{r.achievement.course}</b>{#if r.achievement.level}{" · "}{r.achievement.level}{/if}{" · "}{r.achievement.completedOn}<br /><span class="fine">{t("wFrom")} {names[r.issuer] ?? r.issuer}</span></span>
                            <span class="actions" style="margin:0"><button type="button" onclick={() => (showing = { r, name: false, birthYear: false })}>{t("wShow")}</button><button type="button" class="ghost" onclick={() => remove(r)} aria-label="{t('wRemove')}: {r.achievement.course}">{t("wRemove")}</button></span></li>
                    {/each}
                </ul>
            {:else}
                <p class="fine">{t("wNone")}</p>
            {/if}
        </section>

        <section class="card" aria-labelledby="codeH">
            <h2 id="codeH">{t("wCodeTitle")}</h2>
            <p class="fine">{t("wCodeLead")}</p>
            {#if code}<Qr text={code} label={t("walletQr")} /><details><summary>{t("wAsText")}</summary><p class="mono" id="walletCode">{code}</p></details>{/if}
        </section>

        <section class="card" aria-labelledby="addH">
            <h2 id="addH">{t("wAddTitle")}</h2>
            <Scan label={t("wAddLabel")} found={(x) => { const c = payloadOf(x, "c"); if (c) keep(c).catch((e) => (msg = `${t("wNotRecord")} (${e.message})`)); else msg = t("wNotRecord") }} />
        </section>

        <section class="card" aria-labelledby="bakH">
            <h2 id="bakH">{t("wBackupTitle")}</h2>
            <p class="fine">{t("wBackupLead")}</p>
            <div class="actions"><button type="button" class="ghost" onclick={backup} disabled={!records.length}>{t("wDownload")}</button><label class="btn ghost" style="margin:0">{t("wRestore")}<input type="file" accept="application/json" onchange={restore} hidden /></label></div>
        </section>
    {/if}
</main>
