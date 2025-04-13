let settings = {
    amountLamports: 0,
    slippageBps: 0,
    feeLamports: 0,
    jitoFeeLamports: 0
};

export function applySettings({ amount, slippage, fee, jitoFee }) {
    settings.amountLamports = amount * 1e9;
    settings.slippageBps = slippage * 100;
    settings.feeLamports = fee * 1e9;
    settings.jitoFeeLamports = jitoFee * 1e9;
}

export function getSettings() {
    return { ...settings };
}
