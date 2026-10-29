// URL-safe base64: letters, digits, - and _, so tokens fit in links and cookies as-is
function toBase64Url(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '')
}

// Unguessable random text: 8 bytes makes an 11-character ID, 32 bytes a 43-character token
export function randomToken(byteCount: number): string {
    return toBase64Url(crypto.getRandomValues(new Uint8Array(byteCount)))
}

export async function sha256(text: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return toBase64Url(new Uint8Array(digest))
}