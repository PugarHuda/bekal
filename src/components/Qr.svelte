<script lang="ts">
    import { svg } from "../lib/qr.ts"
    let { text, label }: { text: string; label: string } = $props()
    let out = $state("")
    $effect(() => {
        svg(text).then((s) => (out = s))
    })
</script>

<div class="qr" role="img" aria-label={label}>{@html out}</div>
