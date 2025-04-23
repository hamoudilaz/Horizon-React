import dotenv from 'dotenv';
import WebSocket from 'ws';
import { handleTxFast } from './index.js';

dotenv.config();

const TOKEN = process.env.SYNDICA_TOKEN;

const wsUrl = `wss://api.syndica.io/api-token/${TOKEN}`;
let subscriptionId;
let ws;

export async function syndicaStream(wallet) {

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
                subscriptionId = json.result;
            } else if (json.params?.result?.value) {
                const tx = json.params?.result?.value;
                console.log(json)

                await handleTxFast(tx, wallet, "Syndica")

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



export function unsubscribeSyndica() {
    if (ws?.readyState === 1 && subscriptionId) {
        ws.send(JSON.stringify({
            jsonrpc: '2.0',
            id: 99,
            method: 'chainstream.transactionsUnsubscribe',
            params: [subscriptionId],
        }));
        console.log('🚫 Unsubscribed from Chainstream');
    }
}
