import { getAssociatedTokenAddress, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { pubKey } from '../panelTest.js';
import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.RPC_SHYFT, {
    wsEndpoint: process.env.WSS_SHYFT,
    commitment: 'confirmed',
});

let solMint = 'So11111111111111111111111111111111111111112';

export const getPDA = async (wallet) => {
    const res = await getAssociatedTokenAddress(new PublicKey(solMint), new PublicKey(wallet));
    const PDA = res.toBase58();
    return PDA;
};

// Get Balance
export const getOwnBalance = async () => {
    const res = await getAssociatedTokenAddress(new PublicKey(solMint), new PublicKey(pubKey));
    const PDA = res.toBase58();

    const balanceLamports = await connection.getTokenAccountBalance(new PublicKey(PDA));
    return balanceLamports.value.uiAmount;
};

export function getATA(outputMint) {
    try {
        if (!pubKey) throw new Error('pubKey is undefined');
        return getAssociatedTokenAddressSync(new PublicKey(outputMint), new PublicKey(pubKey));
    } catch (error) {
        return { error: error.message };
    }
}

// Get total USD value
export async function totalOwned(mint, mytokens) {
    try {
        const priceResponse = await fetch(`https://api.jup.ag/price/v2?ids=${mint}`);

        const priceData = await priceResponse.json();

        if (!priceData) throw new Error('Failed to fetch price data');

        const tokenPrice = parseFloat(priceData.data[mint].price);

        const pricetotal = mytokens * tokenPrice;

        return pricetotal.toFixed(5);
    } catch (error) {
        console.error('Error fetching token price:', error);
        return {
            error: error.message,
        };
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function tokenLogo(mint) {
    try {
        if (mint.length === 44) {
            const response = await fetch(process.env.RPC_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: '1',
                    method: 'getAsset',
                    params: {
                        id: mint,
                    },
                }),
            });

            const data = await response.json();

            const content = data?.result?.content;

            if (!content || !content.files || !content.files[0]) return null;

            const logoURI = content.files[0].uri;
            const symbol = content.metadata?.symbol ?? null;

            return { logoURI, symbol };
        } else {
            return null;
        }
    } catch (e) {
        console.error('Error retrieving token logo:', e);
        throw e;
    }
}
