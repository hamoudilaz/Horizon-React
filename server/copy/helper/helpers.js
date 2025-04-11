import { wallet, pubKey, getBalance } from "../../panelTest.js";
import { getATA } from "../../helpers/helper.js";
import { swap } from "../copy-trade.js";


export async function executeSwap(type, inputMint, outputMint) {
    if (type === "buy") {
        const mintATA = getATA(outputMint);
        const ATA = mintATA.toBase58();
        const res = await swap(inputMint, outputMint, ATA)
        console.log(res)
    } else {
        const res = await swap(inputMint, outputMint)
    }
}