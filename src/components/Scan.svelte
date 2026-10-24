<script lang="ts">
    // Paste a link, upload a photo of a QR code, or point the camera at one.
    import { onDestroy } from "svelte"
    import { decodeImage, scanCamera } from "../lib/qr.ts"
    import { t } from "../lib/i18n.svelte.ts"
    let { label, found }: { label: string; found: (text: string) => void } = $props()
    let text = $state("")
    let note = $state("")
    let video = $state<HTMLVideoElement>()
    let stop: (() => void) | null = null
    let scanning = $state(false)
    const id = `scan-${Math.random().toString(36).slice(2, 8)}`

    async function photo(e: Event) {
        const f = (e.target as HTMLInputElement).files?.[0]
        if (!f) return
        const got = await decodeImage(f)
        if (got) found(got)
        else note = t("sNoQr")
    }
    async function camera() {
        note = ""
        scanning = true
        try {
            stop = await scanCamera(video!, (got) => ((scanning = false), found(got)))
        } catch (e) {
            scanning = false
            note = t("sNoCamera", { e: (e as Error).message })
        }
    }
    onDestroy(() => stop?.())
</script>

<div class="scan">
    <label for={id}>{label}</label>
    <textarea id={id} bind:value={text} placeholder={t("sPaste")}></textarea>
    <div class="actions">
        <button type="button" onclick={() => found(text)} disabled={!text.trim()}>{t("sUse")}</button>
        <button type="button" class="ghost" onclick={camera} disabled={scanning}>{t("sCamera")}</button>
        <label class="btn ghost" style="margin:0">{t("sPhoto")}<input type="file" accept="image/*" onchange={photo} hidden /></label>
    </div>
    <video bind:this={video} playsinline muted hidden={!scanning}></video>
    {#if note}<p class="msg" role="status">{note}</p>{/if}
</div>
