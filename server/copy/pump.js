import WebSocket from 'ws';
import { handleTxFast } from './index.js';



export async function listenPump(wallet) {
    const ws = new WebSocket('wss://pumpportal.fun/api/data');

    ws.on('open', () => {
        // Subscribing to trades made by accounts
        let payload = {
            method: 'subscribeAccountTrade',
            keys: [wallet], // array of accounts to watch
        };
        ws.send(JSON.stringify(payload));

        // Subscribing to trades on tokens
    });

    ws.on('message', async (data) => {
        const tx = JSON.parse(data);

        if (tx.mint) {
            await handleTxFast(tx, null, "pump")
        } else {
            console.log(tx);
        }


    });
    setTimeout(() => {
        ws.send(JSON.stringify({
            method: "unsubscribeTokenTrade",
            keys: [wallet]
        }));
    }, 30000);


}

