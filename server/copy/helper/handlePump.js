import { getSettings } from './controller.js';
import { getATA } from './controller.js';
import { swap } from '../copy-buy.js';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export async function handlePump(tx) {
    let result;
    const { buyAmount, PDA, sellAmount } = getSettings();

    if (tx.txType === 'buy') {
        let ATA = getATA(tx.mint);
        result = await swap(SOL_MINT, tx.mint, ATA, Number(buyAmount.toFixed(0)));
    } else {
        if (sellAmount < 25 * 1e6 || !sellAmount) return { skip: 'skipping' };
        result = await swap(tx.mint, SOL_MINT, PDA, Number(sellAmount.toFixed(0)));
    }

    return {
        type: tx.txType.toUpperCase(),
        inputMint: SOL_MINT,
        outputMint: tx.mint,
        result,
    };
}
