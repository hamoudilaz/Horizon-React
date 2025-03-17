import { TOKEN_PROGRAM_ID, AccountLayout, } from '@solana/spl-token';
import { userPublicKey as wallet_address } from './panelTest.js';
import { Connection, PublicKey, } from '@solana/web3.js';
import { getPDA, totalOwned } from './helpers/helper.js';
import WebSocket from 'ws'; // Import WebSocket

const wss = new WebSocket.Server({ port: 5001 });


wss.on('connection', (ws) => {
    console.log('Frontend WebSocket client connected');

    ws.on('close', () => {
        console.log('Frontend WebSocket client disconnected');
    });

    ws.on('message', (message) => {
        console.log('Received from frontend:', message);
    });
});

const connection = new Connection(process.env.RPC_SHYFT, {
    wsEndpoint: process.env.WS_SHYFT,
    commitment: 'confirmed',
});

let solMint = 'So11111111111111111111111111111111111111112';
let otherMint;
let ourBalance;
let tokenBalance;

async function listenToWallets(wallet) {
    try {
        connection.onProgramAccountChange(
            TOKEN_PROGRAM_ID,
            async (data) => {
                const changedMint = AccountLayout.decode(data.accountInfo.data).mint.toBase58();
                const amount = AccountLayout.decode(data.accountInfo.data).amount;
                const balance = Number(amount) / 1e6;









            },
            {
                commitment: 'processed',
                filters: [
                    {
                        dataSize: 165,
                    },
                    {
                        memcmp: {
                            offset: 32,
                            bytes: wallet,
                        },
                    },
                ],
            }
        );
    } catch (error) {
        console.error('Error fetching token price:', error);
        return {
            error: error.message,
        };
    }
}



function broadcastToClients(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

async function start() {
    ourBalance = (await getPDA()) * 1e6;
    console.log('Our balance: ' + ourBalance);
    await listenToWallets(wallet_address);
}

start();
export { wss };
