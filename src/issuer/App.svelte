<script lang="ts">
    // A learning centre issues records. Its key lives in this browser (or is the published demo key); whether the key is
    // recognised is read from the public registry, never decided here.
    import { onMount } from "svelte"
    import { Wallet } from "ethers"
    import config from "../config.json"
    import { issue, type Learner, type Learning } from "../lib/credential.ts"
    import { addressOfJwk, fromB64u, newKey } from "../lib/crypto.ts"
    import { registry, revoke } from "../lib/registry.ts"
    import { get, keyFor, set } from "../lib/store.ts"
    import { t } from "../lib/i18n.svelte.ts"
    import Header from "../components/Header.svelte"
    import Qr from "../components/Qr.svelte"
    import Scan from "../components/Scan.svelte"

    type Issued = { jti: string; course: string; on: string; bound: boolean; revokedTx?: string }
    let mode = $state<"demo" | "own">("demo")
    let key = $state(config.demoIssuer.privateKey)
    const address = $derived(new Wallet(key).address)
    let centreName = $state(config.demoIssuer.name)
    let recognition = $state("")
    let recognised = $state(false)

    let learning = $state<Learning>({ course: "", level: "", completedOn: new Date().toISOString().slice(0, 10), centreRef: "" })
    let hours = $state("")
    let learnerName = $state("")
    let birthYear = $state("")
    let holder = $state<{ jwk: object; address: string } | null>(null)
    let out = $state<{ link: string; credential: string; bound: boolean; learning: Learning } | null>(null)
    let issued = $state<Issued[]>([])
    let msg = $state("")
    let busy = $state(false)

    // Switching centre while the registry is still answering for the previous one must not let that answer land on
    // this one: only the latest load may write.
    let loads = 0
    async function load() {
        const mine = ++loads
        recognition = t("iChecking")
        recognised = false
        const k = mode === "demo" ? config.demoIssuer.privateKey : await keyFor("issuerKey", newKey)
        if (mine !== loads) return
        key = k
        const who = new Wallet(k).address
        const list = (await get<Issued[]>(`issued:${who}`)) ?? []
        if (mine !== loads) return
        issued = list
        try {
            const r = await registry.recognition(who)
            if (mine !== loads) return
            recognised = r.recognised
            centreName = r.recognised ? r.name : who
            recognition = r.recognised ? t("iRecognised", { name: r.name, place: r.place, by: r.by }) : t("iNotRecognised", { reason: t("vNoRecognition").replace(/^✗ /, "") })
        } catch (e) {
            if (mine === loads) recognition = t("iRegistryDown", { e: (e as Error).message })
        }
    }
    onMount(load)

    function walletCode(text: string) {
        try {
            const jwk = JSON.parse(new TextDecoder().decode(fromB64u(text.trim().replace(/^.*bekal-wallet:/, ""))))
            holder = { jwk, address: addressOfJwk(jwk) }
            msg = ""
        } catch {
            msg = t("iBadCode")
        }
    }

    async function go(e: SubmitEvent) {
        e.preventDefault()
        if (!learning.course.trim()) return void (msg = t("iWriteCourse"))
        busy = true
        try {
            const l: Learning = { course: learning.course.trim(), completedOn: learning.completedOn, ...(learning.level?.trim() ? { level: learning.level.trim() } : {}), ...(hours ? { hours: Number(hours) } : {}), ...(learning.centreRef?.trim() ? { centreRef: learning.centreRef.trim() } : {}) }
            const who: Learner = { ...(learnerName.trim() ? { name: learnerName.trim() } : {}), ...(birthYear ? { birthYear: Number(birthYear) } : {}) }
            const { credential, jti } = await issue({ chainId: config.chainId, issuerKey: key, issuerAddress: address, learning: l, learner: who, holderJwk: holder?.jwk })
            out = { credential, bound: !!holder, link: `${location.origin}/wallet#c=${credential}`, learning: l }
            issued = [{ jti, course: l.course, on: l.completedOn, bound: !!holder }, ...issued]
            await set(`issued:${address}`, $state.snapshot(issued))
            msg = holder ? t("iIssuedBound") : t("iIssuedCard")
        } catch (err) {
            msg = t("iCouldNot", { e: (err as Error).message })
        } finally {
            busy = false
        }
    }

    async function withdraw(x: Issued) {
        if (!confirm(t("iRevokeAsk", { x: x.course }))) return
        busy = true
        msg = t("iRevoking")
        try {
            const tx = await revoke(key, x.jti)
            issued = issued.map((y) => (y.jti === x.jti ? { ...y, revokedTx: tx } : y))
            await set(`issued:${address}`, $state.snapshot(issued))
            msg = t("iRevokedMsg")
        } catch (err) {
            msg = t("iCouldNot", { e: (err as Error).message })
        } finally {
            busy = false
        }
    }

    // A centre's own key and its list of issued records, to a file: without the key it cannot withdraw its records.
    async function backupKey() {
        const blob = new Blob([JSON.stringify({ bekalCentre: 1, key, issued: $state.snapshot(issued) })], { type: "application/json" })
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `bekal-centre-${address.slice(0, 8)}.json` })
        a.click()
        URL.revokeObjectURL(a.href)
    }
    async function restoreKey(e: Event) {
        const f = (e.target as HTMLInputElement).files?.[0]
        if (!f) return
        try {
            const j = JSON.parse(await f.text())
            if (j.bekalCentre !== 1 || !/^0x[0-9a-fA-F]{64}$/.test(j.key)) throw new Error("not a Bekal centre key file")
            await set("issuerKey", j.key)
            await set(`issued:${new Wallet(j.key).address}`, j.issued ?? [])
            mode = "own"
            await load()
        } catch (err) {
            msg = t("iCouldNot", { e: (err as Error).message })
        }
    }
</script>

<Header page="issuer" />
<main>
    <h1 class="noprint">{t("iTitle")}</h1>
    <p class="lead noprint">{t("iLead")}</p>

    <section class="card noprint" aria-labelledby="centreH">
        <h2 id="centreH">{t("iCentre")}</h2>
        <label class="check"><input type="radio" name="mode" value="demo" bind:group={mode} onchange={load} />{config.demoIssuer.name}</label>
        <label class="check"><input type="radio" name="mode" value="own" bind:group={mode} onchange={load} />{t("iOwn")}</label>
        <p class="mono">{t("iKey")}: {address}</p>
        <p role="status" class={recognised ? "ok" : "fine"} id="recognition">{recognition}</p>
        {#if mode === "demo"}<p class="fine">{config.demoIssuer.note}</p>{:else}
            <p class="fine">{t("iPilotNote")}</p>
            <p class="fine">{t("iKeyBackupNote")}</p>
            <div class="actions"><button type="button" class="ghost" onclick={backupKey}>{t("iKeyBackup")}</button><label class="btn ghost" style="margin:0">{t("iKeyRestore")}<input type="file" accept="application/json" onchange={restoreKey} hidden /></label></div>
        {/if}
    </section>

    <form class="card noprint" onsubmit={go} aria-labelledby="recH">
        <h2 id="recH">{t("iRecord")}</h2>
        <label for="course">{t("iCourse")}</label>
        <input id="course" bind:value={learning.course} placeholder={t("iCoursePh")} required />
        <div class="row">
            <div><label for="level">{t("iLevel")}</label><input id="level" bind:value={learning.level} placeholder={t("iLevelPh")} /></div>
            <div><label for="hours">{t("iHours")}</label><input id="hours" type="number" min="1" bind:value={hours} /></div>
            <div><label for="done">{t("iDone")}</label><input id="done" type="date" bind:value={learning.completedOn} required /></div>
            <div><label for="ref">{t("iRef")}</label><input id="ref" bind:value={learning.centreRef} placeholder={t("iOptional")} /></div>
        </div>
        <h2 style="margin-top:18px">{t("iLearner")}</h2>
        <div class="row">
            <div><label for="name">{t("iName")}</label><input id="name" bind:value={learnerName} autocomplete="off" /></div>
            <div><label for="by">{t("iBirth")}</label><input id="by" type="number" min="1900" max="2100" bind:value={birthYear} /></div>
        </div>
        <h2 style="margin-top:18px">{t("iGiveTo")}</h2>
        {#if holder}
            <p class="ok" style="overflow-wrap:anywhere">{t("iBound", { a: holder.address })} <button type="button" class="ghost" onclick={() => (holder = null)}>{t("iUseCard")}</button></p>
        {:else}
            <p class="fine">{t("iCardNote")}</p>
            <Scan label={t("iWalletCode")} found={walletCode} />
        {/if}
        <div class="actions"><button type="submit" disabled={busy}>{t("iSign")}</button></div>
        <p class="msg" role="status">{msg}</p>
    </form>

    {#if out}
        <section class="card" aria-labelledby="outH">
            <h2 id="outH">{out.bound ? t("iScanThis") : t("iCardTitle")}</h2>
            <Qr text={out.link} label={t("recordQr")} />
            <!-- What a person reads on the printed card; the QR is what a machine checks, so the card says nothing it does not sign. -->
            <div class="cardtext" id="cardText">
                <b>{out.learning.course}</b>{#if out.learning.level}{" · "}{out.learning.level}{/if}<br />
                {t("cardCompleted")} {out.learning.completedOn}{#if out.learning.hours}{" · "}{t("vHours", { n: out.learning.hours })}{/if}<br />
                {t("cardFrom")} {centreName}
            </div>
            <p class="fine noprint">{out.bound ? t("iBoundHint") : t("iCardHint")}</p>
            <div class="actions noprint"><button type="button" onclick={() => print()}>{t("iPrint")}</button><button type="button" class="ghost" onclick={() => navigator.clipboard?.writeText(out!.link)}>{t("wCopy")}</button></div>
            <details class="noprint"><summary>{t("iSigned")}</summary><p class="mono" id="credential">{out.credential}</p></details>
        </section>
    {/if}

    {#if issued.length}
        <section class="card noprint" aria-labelledby="listH">
            <h2 id="listH">{t("iIssuedList")}</h2>
            <ul class="list">
                {#each issued as x (x.jti)}
                    <li><span>{x.course} · {x.on} · {x.bound ? t("iWallet") : t("iCard")}</span>
                        {#if x.revokedTx}<span class="bad">{t("iRevoked")}</span>{:else}<button type="button" class="ghost" disabled={busy} onclick={() => withdraw(x)}>{t("iRevoke")}</button>{/if}</li>
                {/each}
            </ul>
        </section>
    {/if}
</main>
