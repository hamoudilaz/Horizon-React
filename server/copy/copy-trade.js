import { VersionedTransaction, ComputeBudgetProgram, } from '@solana/web3.js';
import { wallet, pubKey } from '../panelTest.js';
import { Agent, request } from 'undici';
import dotenv from 'dotenv';
import { PDA } from '../server.js';
import { performance } from 'perf_hooks';
import { getSettings } from './helper/controller.js';



dotenv.config();

const agent = new Agent({
    connections: 1,                      // Solo user, no need for concurrency
    keepAliveTimeout: 30_0000,           // 30s idle before closing connection
    keepAliveMaxTimeout: 3000000,     // 1 hour max connection lifespan
    connect: {
        family: 4,                       // Force IPv4 directly
        maxCachedSessions: 5,             // Store TLS sessions to speed reconnects
    },
    headers: {
        connection: 'keep-alive',
    },
});

// API's
const quoteApi = process.env.JUP_QUOTE;
const swapApi = process.env.JUP_SWAP;
const JITO_RPC = process.env.JITO_RPC;



export async function swap(inputmint, outputMint, destination = PDA,) {


    try {

        if (!wallet || !pubKey) throw new Error('Failed to load wallet');

        const { amount, SlippageBps, fee, jitoFee } = getSettings();



        let quote;
        for (let attempt = 1; attempt <= 5; attempt++) {
            const url = `${quoteApi}?inputMint=${inputmint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${SlippageBps}`;

            const start = performance.now();

            console.log(`📡 Requesting quote... (Attempt ${attempt})`);
            const { body: quoteRes } = await request(url, { dispatcher: agent });
            const duration = performance.now() - start;

            quote = await quoteRes.json();
            const slow = duration > 80;

            if (!quote.error && !slow) break;

            console.warn(`⚠️ Quote retry ${attempt}: error=${!!quote.error}, slow=${slow}, duration=${Math.round(duration)}ms`);
        }

        if (quote.error) {
            console.error('Error getting quote:', quote.error);
            return quote.error;
        }

        console.log('Quote received, requesting swap transaction...');

        let swapTransaction;

        for (let attempt = 1; attempt <= 5; attempt++) {
            const start = performance.now();
            const { body: swapRes } = await request(swapApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userPublicKey: pubKey,
                    prioritizationFeeLamports: { jitoTipLamports: jitoFee },
                    dynamicComputeUnitLimit: true,
                    quoteResponse: quote,
                    wrapAndUnwrapSol: false,
                    destinationTokenAccount: destination,
                }),
                dispatcher: agent,
            });
            const duration = performance.now() - start;

            const swap = await swapRes.json();
            swapTransaction = swap.swapTransaction;

            const slow = duration > 80;

            if (swapTransaction && !slow) break;

            console.warn(`⚠️ Swap retry ${attempt}: success=${!!swapTransaction}, slow=${slow}, duration=${Math.round(duration)}ms`);
        }

        if (!swapTransaction) {
            return "Retry getting swap transaction";
        }

        console.log('Swap transaction received, signing...');

        let transaction = VersionedTransaction.deserialize(
            Buffer.from(swapTransaction, 'base64')
        );

        let addPrice =
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: fee,
            });



        const newInstruction = {
            programIdIndex: transaction.message.staticAccountKeys.findIndex(
                (key) =>
                    key.toBase58() === addPrice.programId.toBase58()
            ),
            accountKeyIndexes: addPrice.keys.map((key) =>
                transaction.message.staticAccountKeys.findIndex(
                    (acc) => acc.toBase58() === key.pubkey.toBase58()
                )
            ),
            data: new Uint8Array(addPrice.data),
        };

        transaction.message.compiledInstructions.splice(
            1,
            0,
            newInstruction
        );

        transaction.sign([wallet]);

        const transactionBase64 = Buffer.from(transaction.serialize()).toString(
            'base64'
        );


        const { body: sendResponse } = await request(JITO_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'sendTransaction',
                params: [
                    transactionBase64,
                    {
                        encoding: 'base64',
                        skipPreflight: true,
                    },
                ],
            }),
            dispatcher: agent,
        });


        const sendResult = await sendResponse.json();
        if (sendResult.error) throw new Error(`Transaction error: ${sendResult.error.message}`);
        const signature = sendResult.result;


        console.log(`✅ COPY TRADE: https://solscan.io/tx/${signature}`);


        return signature;
    } catch (err) {
        console.error(`❌ Swap failed:`, err.message);

        return err;
    }
}
