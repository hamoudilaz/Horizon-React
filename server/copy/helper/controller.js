import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, getAssociatedTokenAddress } from '@solana/spl-token';
import { pubKey } from '../../panelTest.js';
import { Agent, request } from 'undici';

const solMint = 'So11111111111111111111111111111111111111112';


export const agent = new Agent({
    connections: 2, // Solo user, no need for concurrency
    keepAliveTimeout: 30_0000, // 30s idle before closing connection
    keepAliveMaxTimeout: 3000000, // 1 hour max connection lifespan
    connect: {
        family: 4, // Force IPv4 directly
        maxCachedSessions: 5, // Store TLS sessions to speed reconnects
    },
    headers: {
        connection: 'keep-alive',
    },
});


export async function fetchWithTimeout(url, ms) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, ms);

    try {
        const { body: quoteRes } = await request(url, { dispatcher: agent, signal: controller.signal });
        return quoteRes;
    } finally {
        clearTimeout(timeout);
    }
}



export async function fetchWithTimeoutSwap(url, ms, payload) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, ms);

    try {
        const { body: swapRes } = await request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            dispatcher: agent,
            signal: controller.signal,
        });

        return swapRes;
    } finally {
        clearTimeout(timeout);
    }
}


let settings = {
    buyAmount: 0,
    SlippageBps: 0,
    fee: 0,
    jitoFee: 0,
    sellAmount: 0,
    ATA: null,
    PDA: null
};

export function applySettings({ amount, slippage, fee, jitoFee, sellAmount, ATA, PDA }) {
    if (amount !== undefined) settings.buyAmount = amount * 1e9;
    if (slippage !== undefined) settings.SlippageBps = slippage * 100;
    if (fee !== undefined) settings.fee = fee * 1e9;
    if (jitoFee !== undefined) settings.jitoFee = jitoFee * 1e9;
    if (sellAmount !== undefined) settings.sellAmount = Number(sellAmount || 0) * 1e6
    if (ATA !== undefined) settings.ATA = ATA;
    if (PDA !== undefined) settings.PDA = PDA;
}
export function getSettings() {
    return { ...settings };
}



export function getATA(outputMint) {
    try {
        if (!pubKey) throw new Error('pubKey is undefined');
        const mintATA = getAssociatedTokenAddressSync(new PublicKey(outputMint), new PublicKey(pubKey));
        const ATA = mintATA.toBase58()
        return ATA
    } catch (error) {
        return { error: error.message };
    }
}


export const getPDA = async (wallet) => {
    const res = await getAssociatedTokenAddress(new PublicKey(solMint), new PublicKey(wallet));
    const PDA = res.toBase58();
    return PDA;
};


export const nextBlockTipWallets = [
    "NextbLoCkVtMGcV47JzewQdvBpLqT9TxQFozQkN98pE",
    "NexTbLoCkWykbLuB1NkjXgFWkX9oAtcoagQegygXXA2",
    "NeXTBLoCKs9F1y5PJS9CKrFNNLU1keHW71rfh7KgA1X",
    "NexTBLockJYZ7QD7p2byrUa6df8ndV2WSd8GkbWqfbb",
    "neXtBLock1LeC67jYd1QdAa32kbVeubsfPNTJC1V5At",
    "nEXTBLockYgngeRmRrjDV31mGSekVPqZoMGhQEZtPVG",
    "NEXTbLoCkB51HpLBLojQfpyVAMorm3zzKg7w9NFdqid",
    "nextBLoCkPMgmG8ZgJtABeScP35qLa2AMCNKntAP7Xc",
];

export const jitoTipWallets = [
    "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
    "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
    "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
    "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
    "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
    "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
    "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
    "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
];