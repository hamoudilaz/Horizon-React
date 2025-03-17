

export async function tokenLogo(mint) {

    const req = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`)

    const { logoURI } = await req.json()
    return logoURI
}
