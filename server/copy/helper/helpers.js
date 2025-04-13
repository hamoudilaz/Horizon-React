import { wallet, pubKey } from "../../panelTest.js";
import { getATA } from "../../helpers/helper.js";
import { swap } from "../copy-trade.js";

export async function executeSwap(type, inputMint, outputMint) {
    try {
        if (type === "buy") {
            const ata = getATA(outputMint);
            if (ata.error) {
                return { error: ata.error };
            }
            const dest = ata.toBase58();
            return await swap(inputMint, outputMint, dest);
        } else {
            return await swap(inputMint, outputMint);
        }
    } catch (err) {
        console.error("❌ Swap failed:", err.message);
        return { error: err.message };
    }
}
