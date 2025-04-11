export async function LoadKey(key) {
    const request = await fetch(`${import.meta.env.VITE_API_URL}/api/loadKey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
    });

    const pubKey = await request.json();

    if (pubKey.error) {
        throw new Error(pubKey.error);
    }

    return pubKey;
}

export function validateKey(key) {
    return key.length >= 86 && key.length <= 89 && /^[A-Za-z0-9]+$/.test(key);
}


