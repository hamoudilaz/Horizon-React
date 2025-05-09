export async function tokenLogo(mint) {
    const req = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`);

    const { logoURI } = await req.json();
    return logoURI;
}

export async function stopCopy() {
    await fetch(`${import.meta.env.VITE_API_URL}/api/stopcopy`);
}

export async function getAmount(pubkey) {

    const solMint = "So11111111111111111111111111111111111111112"
    const pair = await (await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')).json();

    console.log(pair)

    const data = await (await fetch(`https://lite-api.jup.ag/ultra/v1/balances/${pubkey}`)).json();
    const sol = data?.SOL?.uiAmount || 0;
    const wsol = data?.[solMint]?.uiAmount || 0;
    const usdValue = ((sol + wsol) * pair.solana.usd).toFixed(2);

    return {
        usdValue,
        SOL: sol.toFixed(4),
        WSOL: wsol.toFixed(4)
    };
}
