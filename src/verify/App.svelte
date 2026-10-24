<script lang="ts">
    // Anyone checks a record a learner shows: the centre's signature, every disclosed claim, the learner's wallet
    // proof, and the public registry (is the centre recognised, has it withdrawn this record). Needs no account.
    import { onMount } from "svelte"
    import config from "../config.json"
    import { verify, type Verdict } from "../lib/credential.ts"
    import { payloadOf } from "../lib/qr.ts"
    import { registry } from "../lib/registry.ts"
    import { t } from "../lib/i18n.svelte.ts"
    import Header from "../components/Header.svelte"
    import Scan from "../components/Scan.svelte"

    let v = $state<Verdict | null>(null)
    let busy = $state(false)
    let msg = $state("")

    async function check(text: string) {
        const p = payloadOf(text, "p") ?? payloadOf(text, "c")
        if (!p) return void (msg = t("vNotBekal"))
        busy = true
        msg = t("vChecking")
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
    const date = (s?: number) => (s ? new Date(s * 1000).toISOString().slice(0, 10) : "")
    const heading = (x: Verdict) => (x.ok ? t("vOk") : x.revoked ? t("vRevoked") : x.keyBinding === "missing" ? t("vNoWallet") : !x.signature ? t("vForged") : t("vUnrecognised"))
</script>

<Header page="verify" />
<main>
    <h1>{t("vTitle")}</h1>
    <p class="lead">{t("vLead")}</p>
    <p class="msg" role="status">{msg}</p>

    {#if v}
        <section class="card" aria-labelledby="vH" id="verdict">
            <h2 id="vH" class="verdict {v.ok ? 'ok' : 'bad'}">{heading(v)}</h2>
            {#if v.achievement}
                <p style="font-size:20px;margin:6px 0"><b>{v.achievement.course}</b>{#if v.achievement.level}{" · "}{v.achievement.level}{/if}</p>
                <p>{t("vCompleted", { d: v.achievement.completedOn })}{#if v.achievement.hours}{" · "}{t("vHours", { n: v.achievement.hours })}{/if}{#if v.achievement.centreRef}{" · "}{t("vRef", { r: v.achievement.centreRef })}{/if}</p>
                <p>{#if v.learner?.name}<span class="pill">{t("vName", { x: v.learner.name })}</span>{/if}{#if v.learner?.birthYear}<span class="pill">{t("vBorn", { x: v.learner.birthYear })}</span>{/if}{#if v.hidden}<span class="pill">{t("vHidden", { n: v.hidden })}</span>{/if}</p>
            {/if}
            <ul class="checks">
                <li class={v.signature ? "ok" : "bad"}>{v.signature ? "✓" : "✗"} {t("vSigned")} <span class="mono">({v.issuer})</span>{#if v.issuedAt}{" "}{t("vIssued", { d: date(v.issuedAt) })}{/if}</li>
                <li class={v.recognition.recognised ? "ok" : "bad"}>{#if v.recognition.recognised}✓ {t("vRecognised", { name: v.recognition.name, place: v.recognition.place, by: v.recognition.by })} (<a href="{config.explorer}/attestation/view/{v.recognition.uid}" target="_blank" rel="noopener">{t("vOnRegistry")}</a>){:else}{t("vNoRecognition")}{/if}</li>
                <li class={v.revoked ? "bad" : "ok"}>{v.revoked ? t("vWithdrawn") : t("vNotWithdrawn")}</li>
                <li class={v.keyBinding === "missing" ? "bad" : "ok"}>{v.keyBinding === "valid" ? t("vKbValid") : v.keyBinding === "missing" ? t("vKbMissing") : t("vCard")}</li>
            </ul>
            {#if v.error}<p class="fine bad">{v.error}</p>{/if}
            <p class="fine">{t("vFreshness")}</p>
        </section>
    {/if}

    <section class="card" aria-labelledby="sH">
        <h2 id="sH">{t("vScanTitle")}</h2>
        <Scan label={t("vScanLabel")} found={check} />
        {#if busy}<p class="fine">{t("vChecking")}</p>{/if}
    </section>
</main>
