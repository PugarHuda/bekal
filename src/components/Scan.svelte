<script lang="ts">
    // Paste a link, upload a photo of a QR code, or point the camera at one.
    import { onDestroy } from "svelte"
    import { decodeImage, scanCamera } from "../lib/qr.ts"
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
        const t = await decodeImage(f)
        if (t) found(t)
        else note = "No QR code found in that photo. Try a sharper, closer one."
    }
    async function camera() {
        note = ""
        scanning = true
        try {
            stop = await scanCamera(video!, (t) => ((scanning = false), found(t)))
        } catch (e) {
            scanning = false
            note = `The camera is not available here (${(e as Error).message}). Upload a photo or paste the link instead.`
        }
    }
    onDestroy(() => stop?.())
</script>

<div class="scan">
    <label for={id}>{label}</label>
    <textarea id={id} bind:value={text} placeholder="Paste the link or code here"></textarea>
    <div class="actions">
        <button type="button" onclick={() => found(text)} disabled={!text.trim()}>Use this</button>
        <button type="button" class="ghost" onclick={camera} disabled={scanning}>Scan with camera</button>
        <label class="btn ghost" style="margin:0">Upload a photo<input type="file" accept="image/*" onchange={photo} hidden /></label>
    </div>
    <video bind:this={video} playsinline muted hidden={!scanning}></video>
    {#if note}<p class="msg" role="status">{note}</p>{/if}
</div>
