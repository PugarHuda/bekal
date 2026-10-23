<script lang="ts">
    // Anyone checks a record a learner shows: the centre's signature, every disclosed claim, the learner's wallet
    // proof, and the public registry (is the centre recognised, has it withdrawn this record). Needs no account.
    import { onMount } from "svelte"
    import config from "../config.json"
    import { verify, type Verdict } from "../lib/credential.ts"
    import { payloadOf } from "../lib/qr.ts"
    import { registry } from "../lib/registry.ts"
    import Scan from "../components/Scan.svelte"

    let v = $state<Verdict | null>(null)
    let busy = $state(false)
    let msg = $state("")

    async function check(text: string) {
        const p = payloadOf(text, "p") ?? payloadOf(text, "c")
        if (!p) return void (msg = "That is not a Bekal record or presentation.")
        busy = true
        msg = "Checking the signature and the public registry…"
        v = null
        try {
            v = await verify(p, registry)
            msg = ""
        } finally {
            busy = false
        }
    }
    onMount(() => {
        const p = payloadOf(location.hash, "p")
        if (p) {
            history.replaceState(null, "", location.pathname)
            check(p)
        }
    })
    const date = (t?: number) => (t ? new Date(t * 1000).toISOString().slice(0, 10) : "")
</script>

<header class="top"><a class="brand" href="/"><img src="/logo.svg" alt="" width="28" height="28" />BEKAL</a><nav><a href="/issuer">Centre</a><a href="/wallet">Wallet</a><a href="/verify" aria-current="page">Verify</a></nav></header>
<main>
    <h1>Check a learning record</h1>
    <p class="lead">Scan the code the learner shows you. You see what they chose to show and whether it is genuine; nothing about them is looked up anywhere.</p>
    <p class="msg" role="status">{msg}</p>

    {#if v}
        <section class="card" aria-labelledby="vH" id="verdict">
            <h2 id="vH" class="verdict {v.ok ? 'ok' : 'bad'}">{v.ok ? "✓ Genuine record from a recognised centre" : v.revoked ? "✗ Withdrawn by the centre" : v.keyBinding === "missing" ? "✗ Not shown from the learner's wallet" : !v.signature ? "✗ Not a genuine record" : "✗ Not from a recognised centre"}</h2>
            {#if v.achievement}
                <p style="font-size:20px;margin:6px 0"><b>{v.achievement.course}</b>{#if v.achievement.level}{" · "}{v.achievement.level}{/if}</p>
                <p>Completed {v.achievement.completedOn}{#if v.achievement.hours}{" · "}{v.achievement.hours} hours{/if}{#if v.achievement.centreRef}{" · "}centre record {v.achievement.centreRef}{/if}</p>
                <p>{#if v.learner?.name}<span class="pill">Name: {v.learner.name}</span>{/if}{#if v.learner?.birthYear}<span class="pill">Born {v.learner.birthYear}</span>{/if}{#each v.hidden as h}<span class="pill">{h} kept private</span>{/each}</p>
            {/if}
            <ul class="checks">
                <li class={v.signature ? "ok" : "bad"}>{v.signature ? "✓" : "✗"} Signed by the centre's key <span class="mono">{v.issuer}</span>, and every claim shown matches what it signed{#if v.issuedAt} (issued {date(v.issuedAt)}){/if}</li>
                <li class={v.recognition.recognised ? "ok" : "bad"}>{#if v.recognition.recognised}✓ Recognised centre: {v.recognition.name}, {v.recognition.place}. Vouched for by {v.recognition.by} (<a href="{config.explorer}/attestation/view/{v.recognition.uid}" target="_blank" rel="noopener">on the registry</a>){:else}✗ {v.recognition.reason}{/if}</li>
                <li class={v.revoked ? "bad" : "ok"}>{v.revoked ? "✗ The centre has withdrawn this record" : "✓ Not withdrawn by the centre"}</li>
                <li class={v.keyBinding === "missing" ? "bad" : "ok"}>{v.keyBinding === "valid" ? "✓ Shown from the learner's own wallet, in the last 15 minutes" : v.keyBinding === "missing" ? "✗ This record belongs to a wallet, and this showing has no proof from it" : "✓ A printed card (not tied to a phone)"}</li>
            </ul>
            {#if v.error}<p class="fine bad">{v.error}</p>{/if}
            <p class="fine">Withdrawals reach the registry's index about a minute after a centre makes them.</p>
        </section>
    {/if}

    <section class="card" aria-labelledby="sH">
        <h2 id="sH">Scan a code</h2>
        <Scan label="Presentation link or code" found={check} />
        {#if busy}<p class="fine">Checking…</p>{/if}
    </section>
</main>
