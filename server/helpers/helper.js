import { getAssociatedTokenAddress } from '@solana/spl-token';
import { userPublicKey as wallet_address } from '../panelTest.js';
import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.RPC_SHYFT, {
    wsEndpoint: process.env.WSS_SHYFT,
    commitment: 'confirmed',
});

let solMint = 'So11111111111111111111111111111111111111112';

// Get WSOL balance
async function getWSOLBalance(PDA) {
    try {
        const balanceLamports = await connection.getTokenAccountBalance(new PublicKey(PDA));

        return balanceLamports.value.uiAmount;
    } catch (e) {
        console.error('Error retrieving WSOL balance:', e);
    }
}

// Get PDA
export const getPDA = async () => {
    const res = await getAssociatedTokenAddress(new PublicKey(solMint), new PublicKey(wallet_address));
    const PDA = res.toBase58();

    const balance = await getWSOLBalance(PDA);
    return balance;
};

getPDA();

// Get total USD value
export async function totalOwned(mint, mytokens) {
    try {
        const priceResponse = await fetch(`https://api.jup.ag/price/v2?ids=${mint}`);

        const priceData = await priceResponse.json();

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

export async function tokenLogo1(mint) {
    const req = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`);
    console.log(req);
    const { logoURI = "Logo not found", symbol = "Symbol not found" } = await req.json();
    console.log(logoURI, symbol);

    return { logoURI, symbol };
}

export async function tokenLogo(mint) {
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

    const logoURI = data.result.content.files[0].uri;
    const symbol = data.result.content.metadata.symbol;

    return { logoURI, symbol };
}


