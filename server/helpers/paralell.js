import { nextBlockTipWallets, jitoTipWallets } from "../copy/helper/controller.js";
import {
    VersionedTransaction, ComputeBudgetProgram, PublicKey
} from '@solana/web3.js';
import { wallet, pubKey } from "../panelTest.js"
import { agent } from "./fetchTimer.js";





const randomWallet = nextBlockTipWallets[Math.floor(Math.random() * nextBlockTipWallets.length)];
const nextblockPubkey = new PublicKey(randomWallet);


const NOZ_RPC = process.env.NOZ_URL;


export async function sendNextblock(transaction) {


    const tipIndex = transaction.message.staticAccountKeys.findIndex((key) =>
        jitoTipWallets.includes(key.toBase58())
    );

    transaction.message.staticAccountKeys[tipIndex] = nextblockPubkey;

    let addPrice = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: fee
    });


    const newInstruction = {
        programIdIndex: transaction.message.staticAccountKeys.findIndex((key) => key.toBase58() === addPrice.programId.toBase58()),
        accountKeyIndexes: addPrice.keys.map((key) => transaction.message.staticAccountKeys.findIndex((acc) => acc.toBase58() === key.pubkey.toBase58())),
        data: new Uint8Array(addPrice.data),
    };

    transaction.message.compiledInstructions.splice(1, 0, newInstruction);

    transaction.sign([wallet]);

    const transactionBase64 = Buffer.from(transaction.serialize()).toString('base64');



    const { body: sendResponse } = await request(NOZ_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'sendTransaction',
            params: [
                transactionBase64,
                {
                    encoding: 'base64',
                },
            ],
        }),
        dispatcher: agent,
    });

    const sendResult = await sendResponse.json();

}
