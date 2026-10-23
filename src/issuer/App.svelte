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
    import Qr from "../components/Qr.svelte"
    import Scan from "../components/Scan.svelte"

    type Issued = { jti: string; course: string; on: string; bound: boolean; revokedTx?: string }
    let mode = $state<"demo" | "own">("demo")
    let key = $state(config.demoIssuer.privateKey)
    const address = $derived(new Wallet(key).address)
    let recognition = $state("Checking the public registry…")
    let recognised = $state(false)

    let learning = $state<Learning>({ course: "", level: "", completedOn: new Date().toISOString().slice(0, 10), centreRef: "" })
    let hours = $state("")
    let learner = $state<Learner & { birthYear?: number }>({ name: "" })
    let birthYear = $state("")
    let holder = $state<{ jwk: object; address: string } | null>(null)
    let out = $state<{ link: string; credential: string; bound: boolean } | null>(null)
    let issued = $state<Issued[]>([])
    let msg = $state("")
    let busy = $state(false)

    async function load() {
        key = mode === "demo" ? config.demoIssuer.privateKey : await keyFor("issuerKey", newKey)
        issued = (await get<Issued[]>(`issued:${new Wallet(key).address}`)) ?? []
        recognition = "Checking the public registry…"
        recognised = false
        try {
            const r = await registry.recognition(new Wallet(key).address)
            recognised = r.recognised
            recognition = r.recognised ? `Recognised: ${r.name}, ${r.place}. Vouched for by ${r.by}.` : `Not recognised: ${r.reason}. Records from this key will verify as signed, but not as from a recognised centre.`
        } catch (e) {
            recognition = `The registry could not be read right now (${(e as Error).message}).`
        }
    }
    onMount(load)

    function walletCode(text: string) {
        try {
            const t = text.trim().replace(/^.*bekal-wallet:/, "")
            const jwk = JSON.parse(new TextDecoder().decode(fromB64u(t)))
            holder = { jwk, address: addressOfJwk(jwk) }
            msg = ""
        } catch {
            msg = "That is not a Bekal wallet code. Ask the learner to open their wallet and show “My wallet code”."
        }
    }

    async function go(e: SubmitEvent) {
        e.preventDefault()
        if (!learning.course.trim()) return void (msg = "Write what was learned.")
        busy = true
        try {
            const l: Learning = { course: learning.course.trim(), completedOn: learning.completedOn, ...(learning.level?.trim() ? { level: learning.level.trim() } : {}), ...(hours ? { hours: Number(hours) } : {}), ...(learning.centreRef?.trim() ? { centreRef: learning.centreRef.trim() } : {}) }
            const who: Learner = { ...(learner.name?.trim() ? { name: learner.name.trim() } : {}), ...(birthYear ? { birthYear: Number(birthYear) } : {}) }
            const { credential, jti } = await issue({ chainId: config.chainId, issuerKey: key, issuerAddress: address, learning: l, learner: who, holderJwk: holder?.jwk })
            out = { credential, bound: !!holder, link: `${location.origin}/wallet#c=${credential}` }
            issued = [{ jti, course: l.course, on: l.completedOn, bound: !!holder }, ...issued]
            await set(`issued:${address}`, $state.snapshot(issued))
            msg = holder ? "Issued, bound to the learner's wallet. Let them scan the code." : "Issued as a printed card: print it and give it to the learner."
        } catch (e) {
            msg = `Could not issue: ${(e as Error).message}`
        } finally {
            busy = false
        }
    }

    async function withdraw(x: Issued) {
        if (!confirm(`Revoke “${x.course}”? This is permanent and public.`)) return
        busy = true
        msg = "Writing the revocation to the registry…"
        try {
            const tx = await revoke(key, x.jti)
            issued = issued.map((y) => (y.jti === x.jti ? { ...y, revokedTx: tx } : y))
            await set(`issued:${address}`, $state.snapshot(issued))
            msg = "Revoked. Verifiers will see it within about a minute, once the registry's index has caught up."
        } catch (e) {
            msg = `Could not revoke: ${(e as Error).message}`
        } finally {
            busy = false
        }
    }
</script>

<header class="top noprint"><a class="brand" href="/"><img src="/logo.svg" alt="" width="28" height="28" />BEKAL</a><nav><a href="/issuer" aria-current="page">Centre</a><a href="/wallet">Wallet</a><a href="/verify">Verify</a></nav></header>
<main>
    <h1 class="noprint">Issue a learning record</h1>
    <p class="lead noprint">For learning centres. The record is signed in this browser and handed to the learner; nothing about the learner is sent anywhere or written to a blockchain.</p>

    <section class="card noprint" aria-labelledby="centreH">
        <h2 id="centreH">Your centre</h2>
        <label class="check"><input type="radio" name="mode" value="demo" bind:group={mode} onchange={load} />{config.demoIssuer.name}</label>
        <label class="check"><input type="radio" name="mode" value="own" bind:group={mode} onchange={load} />My own centre (a new key, kept in this browser)</label>
        <p class="mono">Key: {address}</p>
        <p role="status" class={recognised ? "ok" : "fine"} id="recognition">{recognition}</p>
        {#if mode === "demo"}<p class="fine">{config.demoIssuer.note}</p>{:else}<p class="fine">In a pilot, a recognised body (for example UNHCR's list of recognised learning centres, or an NGO consortium) vouches for this key on the registry.</p>{/if}
    </section>

    <form class="card noprint" onsubmit={go} aria-labelledby="recH">
        <h2 id="recH">The record</h2>
        <label for="course">What was learned</label>
        <input id="course" bind:value={learning.course} placeholder="e.g. Mathematics, Grade 6" required />
        <div class="row">
            <div><label for="level">Level or result</label><input id="level" bind:value={learning.level} placeholder="e.g. Completed, B1" /></div>
            <div><label for="hours">Hours</label><input id="hours" type="number" min="1" bind:value={hours} /></div>
            <div><label for="done">Completed on</label><input id="done" type="date" bind:value={learning.completedOn} required /></div>
            <div><label for="ref">Centre's record number</label><input id="ref" bind:value={learning.centreRef} placeholder="optional" /></div>
        </div>
        <h2 style="margin-top:18px">The learner (optional, hidden unless they choose to show it)</h2>
        <div class="row">
            <div><label for="name">Name</label><input id="name" bind:value={learner.name} autocomplete="off" /></div>
            <div><label for="by">Birth year</label><input id="by" type="number" min="1900" max="2100" bind:value={birthYear} /></div>
        </div>
        <h2 style="margin-top:18px">Give it to</h2>
        {#if holder}
            <p class="ok">The learner's wallet <span class="mono">{holder.address}</span>: only that wallet can show this record. <button type="button" class="ghost" onclick={() => (holder = null)}>Use a printed card instead</button></p>
        {:else}
            <p class="fine">Without a wallet code, the record is a printed card anyone holding it can show, like paper.</p>
            <Scan label="Learner's wallet code" found={walletCode} />
        {/if}
        <div class="actions"><button type="submit" disabled={busy}>Sign and issue</button></div>
        <p class="msg" role="status">{msg}</p>
    </form>

    {#if out}
        <section class="card" aria-labelledby="outH">
            <h2 id="outH">{out.bound ? "Let the learner scan this" : "Printed card"}</h2>
            <Qr text={out.link} label="Learning record QR code" />
            <p class="fine">{out.bound ? "Scanning it with the learner's phone opens their wallet and saves the record." : "Scanning it opens a Bekal wallet and saves the record there; keep the paper safe as a backup."}</p>
            <div class="actions noprint"><button type="button" onclick={() => print()}>Print</button><button type="button" class="ghost" onclick={() => navigator.clipboard?.writeText(out!.link)}>Copy link</button></div>
            <details class="noprint"><summary>The signed record (SD-JWT VC)</summary><p class="mono" id="credential">{out.credential}</p></details>
        </section>
    {/if}

    {#if issued.length}
        <section class="card noprint" aria-labelledby="listH">
            <h2 id="listH">Issued from this key</h2>
            <ul class="list">
                {#each issued as x (x.jti)}
                    <li><span>{x.course} · {x.on} · {x.bound ? "wallet" : "card"}</span>
                        {#if x.revokedTx}<span class="bad">Revoked</span>{:else}<button type="button" class="ghost" disabled={busy} onclick={() => withdraw(x)}>Revoke</button>{/if}</li>
                {/each}
            </ul>
        </section>
    {/if}
</main>
