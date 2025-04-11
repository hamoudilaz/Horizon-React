import { VersionedTransaction, ComputeBudgetProgram, } from '@solana/web3.js';
import { wallet, pubKey } from '../panelTest.js';
import { Agent, request } from 'undici';
import dotenv from 'dotenv';
import { PDA } from '../server.js';


dotenv.config();

const agent = new Agent({
    connections: 3,
    keepAliveTimeout: 2000,
    keepAliveMaxTimeout: 10_000,
    connect: {
        autoSelectFamily: true,
        autoSelectFamilyAttemptTimeout: 100,
        maxCachedSessions: 3,
        tls: {
            servername: 'api.jup.ag',
            rejectUnauthorized: true,
        },
    },
    headers: {
        'accept-encoding': 'br, gzip, deflate',
        'connection': 'keep-alive',
    },
});

// API's
const quoteApi = process.env.JUP_QUOTE;
const swapApi = process.env.JUP_SWAP;
const JITO_RPC = process.env.JITO_RPC;



let amount
let SlippageBps
let fee
let jitoFee

export function settings(params) {
    amount = params.amount * 1e9
    SlippageBps = params.slippage * 100
    fee = params.fee * 1e9
    jitoFee = params.jitoFee * 1e9
}


export async function swap(inputmint, outputMint, destination = PDA,) {

    console.log("inputMint:", inputmint)
    console.log("outputMint:", outputMint)
    console.log("destination:", destination)
    console.log("amount:", amount)
    console.log("SlippageBps:", SlippageBps)
    console.log("fee:", fee)
    console.log("jitoFee:", jitoFee)
    return "sucess"
    try {

        if (!wallet || !pubKey) throw new Error('Failed to load wallet');


        const url = `${quoteApi}?inputMint=${inputmint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${SlippageBps}&onlyDirectRoutes=true`;

        console.log('Requesting quote...');


        const { body: quoteRes } = await request(url, { dispatcher: agent });
        const quote = await quoteRes.json();



        if (quote.error) {
            console.error('Error getting quote:', quote.error);
            return "Retry getting quote";
        }

        console.log('Quote received, requesting swap transaction...');


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

        const swap = await swapRes.json();
        const { swapTransaction } = swap


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
        if (sendResult.error) {
            console.error('Error sending transaction:', sendResult.error);
            throw new Error(sendResult.error.message);
        }

        console.log(`Transaction confirmed: https://solscan.io/tx/${sendResult.result}`);
        return sendResult;
    } catch (err) {
        return err;
    }
}
