<script lang="ts">
    import { LANGS, apply, t, ui, type Lang } from "../lib/i18n.svelte.ts"
    let { page }: { page: "issuer" | "wallet" | "verify" } = $props()
</script>

<header class="top noprint">
    <a class="brand" href="/"><img src="/logo.svg" alt="" width="28" height="28" />BEKAL</a>
    <nav>
        <a href="/issuer" aria-current={page === "issuer" ? "page" : undefined}>{t("navCentre")}</a>
        <a href="/wallet" aria-current={page === "wallet" ? "page" : undefined}>{t("navWallet")}</a>
        <a href="/verify" aria-current={page === "verify" ? "page" : undefined}>{t("navVerify")}</a>
        <select aria-label={t("language")} value={ui.lang} onchange={(e) => apply((e.target as HTMLSelectElement).value as Lang)} class="lang">
            {#each Object.entries(LANGS) as [code, name] (code)}<option value={code} lang={code === "prs" ? "fa-AF" : code}>{name}</option>{/each}
        </select>
    </nav>
    {#if ui.lang !== "en"}<p class="review" role="note">{t("reviewNote")}</p>{/if}
</header>
