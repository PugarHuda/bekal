// QR codes in and out. Records travel as links (…/wallet#c=… and …/verify#p=…): any phone camera opens them, and the
// part after # never reaches a server. Decoding uses jsQR on a camera frame or a photo, so it works on every browser.
import QRCode from "qrcode"
import jsQR from "jsqr"

export const svg = (text: string) => QRCode.toString(text, { type: "svg", errorCorrectionLevel: "L", margin: 2 })

const fromCanvas = (c: HTMLCanvasElement) => {
    const ctx = c.getContext("2d", { willReadFrequently: true })!
    const img = ctx.getImageData(0, 0, c.width, c.height)
    return jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" })?.data ?? null
}

/** The text in a photo of a QR code, or null. */
export async function decodeImage(file: Blob): Promise<string | null> {
    const bmp = await createImageBitmap(file)
    const c = document.createElement("canvas")
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height)
    return fromCanvas(c)
}

/** Reads the camera until a QR code is found; call the returned stop() to give the camera back. */
export async function scanCamera(video: HTMLVideoElement, found: (text: string) => void): Promise<() => void> {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
    video.srcObject = stream
    await video.play()
    const c = document.createElement("canvas")
    let live = true
    const tick = () => {
        if (!live) return
        if (video.videoWidth) {
            c.width = video.videoWidth
            c.height = video.videoHeight
            c.getContext("2d")!.drawImage(video, 0, 0)
            const text = fromCanvas(c)
            if (text) {
                stop()
                return found(text)
            }
        }
        requestAnimationFrame(tick)
    }
    const stop = () => {
        live = false
        stream.getTracks().forEach((t) => t.stop())
    }
    requestAnimationFrame(tick)
    return stop
}

/** A record or presentation from whatever was scanned or pasted: a Bekal link, or the bare SD-JWT. */
export function payloadOf(text: string, key: "c" | "p"): string | null {
    const t = text.trim()
    const m = new RegExp(`[#&]${key}=([^&\\s]+)`).exec(t)
    const raw = m ? decodeURIComponent(m[1]) : t
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+~/.test(raw) ? raw : null
}
