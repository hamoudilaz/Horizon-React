

export async function tokenLogo(mint) {

    const req = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`)

    const { logoURI } = await req.json()
    return logoURI
}



export async function stopCopy() {
    await fetch(`${import.meta.env.VITE_API_URL}/api/stopcopy`)
}
