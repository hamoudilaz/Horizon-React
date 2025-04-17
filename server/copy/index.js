import { txid } from './decod.js';
import { applySettings, getPDA } from './helper/controller.js';
import { pubKey } from '../panelTest.js';
import { listenToWallets } from './helper/helpers.js';
import { grpcStream } from './grpc.js';
import { syndicaStream } from './syndica.js';

let claimed = false;
let locking = false;

export async function handleTxFast(tx, wallet, who) {
    if (locking || claimed) return;
    locking = true;
    claimed = true;
    locking = false;

    console.log(who);
    const result = await txid(tx, wallet);
    claimed = false;
    if (result.error) {
        console.log('❌ Error copying wallet:', result.error);
    } else if (result.skip) {
        console.log('⏭️ Skipped:', result.skip);
    } else {
        console.log(`\x1b[1m\x1b[32m✅ COPY ${result.type}:\x1b[0m \x1b[36mhttps://solscan.io/tx/${result.result}\x1b[0m`);
    }
}

export async function main(wallet, config) {
    console.log(config)
    try {
        let settings = {
            amount: config.amount,
            slippage: config.slippage,
            fee: config.fee,
            jitoFee: config.jitoFee,
            ATA: '',
            PDA: await getPDA(pubKey),
            sellAmount: 0,
        };


        applySettings(settings);
        listenToWallets(pubKey);
        grpcStream(wallet);
        syndicaStream(wallet);

    } catch (error) {
        console.error(error);
        return error;
    }
}
