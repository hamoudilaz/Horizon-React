import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();



const connection = new Connection(process.env.RPC_URL, 'processed');

let wallet = null;

let pubKey = null;

console.log(pubKey)

function loadKey(key) {
    try {
        if (!key) throw new Error('Key is undefined or empty');

        wallet = Keypair.fromSecretKey(bs58.decode(key));
        if (!wallet) throw new Error('Failed to generate wallet');

        pubKey = wallet.publicKey.toBase58();
        console.log('Your PublicKey: ' + pubKey);

        return pubKey;
    } catch (error) {
        console.error('loadKey error:', error.message);
        return null;
    }
}



async function getBalance(outputMint) {
    try {
        const getDecimal = await fetch(`https://api.jup.ag/tokens/v1/token/${outputMint}`);
        const json = await getDecimal.json();

        const decimals = json?.decimals ?? 6;

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
            mint: new PublicKey(outputMint),
        });

        if (!tokenAccounts.value?.length) throw new Error('No token account found');

        const amountToSell = Math.floor(
            tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
        );

        return { amountToSell, decimals };
    } catch (error) {
        console.error('getBalance error:', error.message);
        return { amountToSell: 0, decimals: 6 };
    }
}

export { wallet, pubKey, getBalance, loadKey };
