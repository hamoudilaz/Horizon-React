import dotenv from 'dotenv';
import WebSocket from 'ws';
import { handleTxFast } from './index.js';

dotenv.config();

const TOKEN = process.env.SYNDICA_TOKEN;

const wsUrl = `wss://api.syndica.io/api-token/${TOKEN}`;

export async function syndicaStream(wallet) {
    let ws;
    let txCount = 0;

    function connect() {
        ws = new WebSocket(wsUrl);

        ws.on('open', () => {
            ws.send(
                JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'chainstream.transactionsSubscribe',
                    params: {
                        network: 'solana-mainnet',
                        verified: false,
                        filter: {
                            commitment: 'processed',
                            accountKeys: {
                                all: [wallet],
                            },
                        },
                    },
                })
            );

            setInterval(() => {
                ws.ping();
            }, 30000);
        });

        ws.on('message', async (data) => {
            const json = JSON.parse(data.toString());
            if (txCount === 0) {
                console.log('🆗 Subscribed:', json);
            } else {
                const tx = json.params?.result?.value;

                await handleTxFast(tx, wallet, "Syndica")

                // const result = await txid(tx, wallet);
                // if (result.error) {
                //     console.log("❌ Error copying wallet");
                // } else if (result.skip) {
                //     console.log("⏭️ Skipped:", result.skip);
                // } else {
                //     console.log(`\x1b[1m\x1b[32m✅ COPY ${result.type}:\x1b[0m \x1b[36mhttps://solscan.io/tx/${result.result}\x1b[0m`);
                // }
            }
            txCount++;
        });

        ws.on('close', () => {
            console.warn('🔌 Disconnected. Reconnecting...');
            setTimeout(connect, 2000);
        });

        ws.on('error', (err) => {
            console.error('❌ WebSocket error:', err.message);
        });
    }
    connect();
}
