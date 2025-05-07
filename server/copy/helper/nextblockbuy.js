import { VersionedTransaction, ComputeBudgetProgram, PublicKey } from '@solana/web3.js';
import { wallet, pubKey } from '../panelTest.js';
import { performance } from 'perf_hooks';
import { getSettings } from './helper/controller.js';
import { Agent, request } from 'undici';
import { jitoTipWallets, nextBlockTipWallets } from './helper/controller.js';

import dotenv from 'dotenv';

dotenv.config();

// AGENT CONFIG SETTINGS
const agent = new Agent({
    connections: 1, // Solo user, no need for concurrency
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

const randomWallet = nextBlockTipWallets[Math.floor(Math.random() * nextBlockTipWallets.length)];
const nextBlockValidatorPubkey = new PublicKey(randomWallet);



const quoteApi = process.env.JUP_QUOTE;
const swapApi = process.env.JUP_SWAP;
const NEXTBLOCK = process.env.NB_URL;
const token = process.env.NB_TOKEN;

export async function swap(inputmint, outputMint, destination, amount) {
    try {
        const { SlippageBps, fee, jitoFee } = getSettings();


        if (!wallet || !pubKey) throw new Error('Failed to load wallet');

        const url = `${quoteApi}?inputMint=${inputmint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${SlippageBps}`;

        let quote;
        for (let attempt = 1; attempt <= 5; attempt++) {
            try {
                console.log(`📡 Requesting quote... (Attempt ${attempt})`);

                const quoteRes = await fetchWithTimeout(url, 120);

                quote = await quoteRes.json();
                if (!quote.error) break;
                console.log(quote.error)
            } catch (err) {
                console.warn(`⚠️ Quote retry ${attempt}: timeout or fetch error`);
            }
        }

        if (quote.error) {
            console.error('Error getting quote:', quote.error);
            return quote.error;
        }

        let swapTransaction;


        for (let attempt = 1; attempt <= 5; attempt++) {
            try {
                const swapRes = await fetchWithTimeoutSwap(swapApi, 120, {
                    userPublicKey: pubKey,
                    prioritizationFeeLamports: { jitoTipLamports: jitoFee },
                    dynamicComputeUnitLimit: true,
                    quoteResponse: quote,
                    wrapAndUnwrapSol: false,
                    destinationTokenAccount: destination,
                });
                const swap = await swapRes.json();
                swapTransaction = swap.swapTransaction;

                if (swapTransaction) break;
                console.warn(`⚠️ Swap retry ${attempt}: no swapTransaction`);
            } catch (err) {
                console.warn(`⚠️ Swap retry ${attempt}: timeout or fetch error`);
            }
        }

        if (!swapTransaction) {
            return { error: 'Retry getting swap transaction' };
        }

        let transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));


        const tipIndex = transaction.message.staticAccountKeys.findIndex((key) =>
            jitoTipWallets.includes(key.toBase58())
        );

        transaction.message.staticAccountKeys[tipIndex] = nextBlockValidatorPubkey;


        let addPrice = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: fee,
        });

        const newInstruction = {
            programIdIndex: transaction.message.staticAccountKeys.findIndex((key) => key.toBase58() === addPrice.programId.toBase58()),
            accountKeyIndexes: addPrice.keys.map((key) => transaction.message.staticAccountKeys.findIndex((acc) => acc.toBase58() === key.pubkey.toBase58())),
            data: new Uint8Array(addPrice.data),
        };

        transaction.message.compiledInstructions.splice(1, 0, newInstruction);

        transaction.sign([wallet]);

        const transactionBase64 = Buffer.from(transaction.serialize()).toString('base64');

        const { body: sendResponse } = await request(NEXTBLOCK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Authorization": token },
            body: JSON.stringify({
                "transaction": {
                    "content": transactionBase64
                },
                "frontRunningProtection": true
            }),
            dispatcher: agent,
        })

        const sendResult = await sendResponse.json();
        console.log(sendResult)

        if (sendResult.error) throw new Error(`Transaction error: ${sendResult.error.message}`);

        return sendResult.signature
    } catch (err) {
        console.error(`❌ Swap failed:`, err.message);

        return err;
    }
}
