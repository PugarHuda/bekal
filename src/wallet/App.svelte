<script lang="ts">
    // The learner's wallet: a key made on this phone, the records it holds, and presentations the learner shapes
    // themselves. Works offline once opened (sw.js). Nothing leaves the phone except what the learner chooses to show.
    import { onMount } from "svelte"
    import config from "../config.json"
    import { decode, jwkOf, present, type Learner, type Learning } from "../lib/credential.ts"
    import { addressOfDid, b64u, newKey } from "../lib/crypto.ts"
    import { payloadOf } from "../lib/qr.ts"
    import { get, keyFor, set } from "../lib/store.ts"
    import Qr from "../components/Qr.svelte"
    import Scan from "../components/Scan.svelte"

    type Held = { credential: string; jti: string; issuer: string; achievement: Learning; learner: Learner; bound: boolean; added: string }
    let key = $state("")
    let records = $state<Held[]>([])
    let code = $state("")
    let showing = $state<{ r: Held; name: boolean; birthYear: boolean; link?: string } | null>(null)
    let msg = $state("")
    let names = $state<Record<string, string>>({})

    async function keep(credential: string) {
        const { payload } = await decode(credential)
        if (records.some((r) => r.jti === payload.jti)) return void (msg = "This record is already in your wallet.")
        const held: Held = { credential, jti: payload.jti, issuer: addressOfDid(payload.iss), achievement: payload.achievement, learner: payload.learner ?? {}, bound: !!payload.cnf, added: new Date().toISOString().slice(0, 10) }
        records = [held, ...records]
        await set("records", $state.snapshot(records))
        msg = `Saved: ${held.achievement.course}.`
        lookup()
    }

    async function lookup() {
        if (!navigator.onLine) return
        const { registry } = await import("../lib/registry.ts")
        for (const a of new Set(records.map((r) => r.issuer))) {
            if (names[a]) continue
            registry.recognition(a).then((r) => (names = { ...names, [a]: r.recognised ? r.name : "a centre not on the registry" })).catch(() => {})
        }
    }

    onMount(async () => {
        key = await keyFor("holderKey", newKey)
        code = `bekal-wallet:${b64u(new TextEncoder().encode(JSON.stringify(jwkOf(key))))}`
        records = (await get<Held[]>("records")) ?? []
        const incoming = payloadOf(location.hash, "c")
        if (incoming) {
            history.replaceState(null, "", location.pathname) // the record does not stay in the address bar
            await keep(incoming).catch((e) => (msg = `That link holds no valid record (${(e as Error).message}).`))
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
            msg = `Could not make the presentation: ${(e as Error).message}`
        }
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
            if (!confirm("Restore this backup? It replaces the wallet key on this phone.")) return
            key = j.holderKey
            await set("holderKey", key)
            const known = new Set(records.map((r) => r.jti))
            records = [...records, ...(j.records as Held[]).filter((r) => !known.has(r.jti))]
            await set("records", $state.snapshot(records))
            code = `bekal-wallet:${b64u(new TextEncoder().encode(JSON.stringify(jwkOf(key))))}`
            msg = `Restored ${j.records.length} record(s).`
        } catch (err) {
            msg = `Could not restore: ${(err as Error).message}`
        }
    }
</script>

<header class="top"><a class="brand" href="/"><img src="/logo.svg" alt="" width="28" height="28" />BEKAL</a><nav><a href="/issuer">Centre</a><a href="/wallet" aria-current="page">Wallet</a><a href="/verify">Verify</a></nav></header>
<main>
    <h1>My learning records</h1>
    <p class="lead">Kept on this phone only. You choose what to show, and to whom.</p>
    <p class="msg" role="status">{msg}</p>

    {#if showing}
        <section class="card" aria-labelledby="showH">
            <h2 id="showH">Show “{showing.r.achievement.course}”</h2>
            <p class="fine">What was learned is always shown. Your details stay hidden unless you tick them.</p>
            {#if showing.r.learner.name}<label class="check"><input type="checkbox" bind:checked={showing.name} onchange={() => showing && (showing.link = undefined)} />Show my name</label>{/if}
            {#if showing.r.learner.birthYear}<label class="check"><input type="checkbox" bind:checked={showing.birthYear} onchange={() => showing && (showing.link = undefined)} />Show my birth year</label>{/if}
            {#if showing.link}
                <Qr text={showing.link} label="Presentation QR code" />
                <p class="fine">Valid for 15 minutes{showing.r.bound ? ", and only from this wallet" : ""}. The verifier scans it with any phone camera.</p>
                <div class="actions"><button type="button" class="ghost" onclick={() => navigator.clipboard?.writeText(showing!.link!)}>Copy link</button><a class="btn ghost" href={showing.link} id="openVerify">Open the check</a></div>
            {:else}
                <div class="actions"><button type="button" onclick={show}>Make the code</button></div>
            {/if}
            <div class="actions"><button type="button" class="ghost" onclick={() => (showing = null)}>Back</button></div>
        </section>
    {:else}
        <section class="card" aria-labelledby="recH">
            <h2 id="recH">Records ({records.length})</h2>
            {#if records.length}
                <ul class="list">
                    {#each records as r (r.jti)}
                        <li><span><b>{r.achievement.course}</b>{#if r.achievement.level}{" · "}{r.achievement.level}{/if}{" · "}{r.achievement.completedOn}<br /><span class="fine">from {names[r.issuer] ?? r.issuer}</span></span>
                            <button type="button" onclick={() => (showing = { r, name: false, birthYear: false })}>Show</button></li>
                    {/each}
                </ul>
            {:else}
                <p class="fine">No records yet. When your centre gives you one, scan its code with this phone's camera, or add it below.</p>
            {/if}
        </section>

        <section class="card" aria-labelledby="codeH">
            <h2 id="codeH">My wallet code</h2>
            <p class="fine">Show this to your centre when they issue a record, so only this wallet can show it.</p>
            {#if code}<Qr text={code} label="My wallet code" /><details><summary>As text</summary><p class="mono" id="walletCode">{code}</p></details>{/if}
        </section>

        <section class="card" aria-labelledby="addH">
            <h2 id="addH">Add a record</h2>
            <Scan label="Record link or code" found={(t) => { const c = payloadOf(t, "c"); if (c) keep(c).catch((e) => (msg = `Not a valid record (${e.message}).`)); else msg = "That is not a Bekal record." }} />
        </section>

        <section class="card" aria-labelledby="bakH">
            <h2 id="bakH">Backup</h2>
            <p class="fine">Phones get lost. Keep a backup file somewhere safe (a trusted relative's phone, a USB stick). It contains your wallet key: whoever has it can show your records.</p>
            <div class="actions"><button type="button" class="ghost" onclick={backup} disabled={!records.length}>Download backup</button><label class="btn ghost" style="margin:0">Restore a backup<input type="file" accept="application/json" onchange={restore} hidden /></label></div>
        </section>
    {/if}
</main>
