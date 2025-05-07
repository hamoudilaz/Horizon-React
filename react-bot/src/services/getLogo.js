export async function tokenLogo(mint) {
    const req = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`);

    const { logoURI } = await req.json();
    return logoURI;
}

export async function stopCopy() {
    await fetch(`${import.meta.env.VITE_API_URL}/api/stopcopy`);
}

export async function getAmount(pubkey) {
    const pair = await (await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')).json();

    const data = await (await fetch(`https://lite-api.jup.ag/ultra/v1/balances/${pubkey}`)).json();
    const usdValue = (data?.SOL?.uiAmount * pair.solana.usd).toFixed(2);
    const SOL = data?.SOL?.uiAmount.toFixed(4)
    return { usdValue, SOL }
}
