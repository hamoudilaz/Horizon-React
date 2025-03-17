import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { userPublicKey as wallet_address } from './panelTest.js';
import { Connection, PublicKey } from '@solana/web3.js';
import { getPDA, totalOwned, tokenLogo } from './helpers/helper.js';
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

const connection = new Connection(process.env.RPC_URL, {
    wsEndpoint: process.env.WSS_SHYFT,
    commitment: 'confirmed',
});

let solMint = 'So11111111111111111111111111111111111111112';
let otherMint;
let ourBalance;
let tokenBalance;
let tokens = {};

async function listenToWallets(wallet) {
    try {
        connection.onProgramAccountChange(
            TOKEN_PROGRAM_ID,
            async (data) => {
                const changedMint = AccountLayout.decode(data.accountInfo.data).mint.toBase58();
                const amount = AccountLayout.decode(data.accountInfo.data).amount;
                const balance = Number(amount) / 1e6;
                console.log(balance);
                console.log(changedMint);

                if (changedMint === solMint) {
                    console.log('SOL mint: ', changedMint);
                    ourBalance = balance.toFixed(2);
                    console.log('SOL balance: ', ourBalance);
                } else {
                    otherMint = changedMint;
                    console.log('Other mint: ', otherMint);
                    tokenBalance = balance.toFixed(2);
                    console.log('Token balance: ', tokenBalance);
                    if (tokenBalance >= 3) {
                        const { logoURI, symbol } = await tokenLogo(otherMint);
                        const totalTokenValue = await totalOwned(otherMint, tokenBalance);

                        tokens[otherMint] = {
                            tokenMint: otherMint,
                            tokenBalance,
                            usdValue: totalTokenValue,
                            logoURI,
                            symbol,
                        };

                        broadcastToClients(tokens[otherMint]);
                    } else {
                        console.log(`Token balance for ${otherMint} is less than 5. Removing the token info.`);
                        delete tokens[otherMint];
                        broadcastToClients({ tokenMint: otherMint, removed: true });
                    }
                }
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
    } catch (err) {
        console.error('Error listening to wallets:', err);
    }
}

function broadcastToClients(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

export async function refreshTokenPrices() {
    for (const mint in tokens) {
        const updatedValue = await totalOwned(mint, tokens[mint].tokenBalance);
        tokens[mint].usdValue = updatedValue;
        console.log('Updated token value:', updatedValue);
        broadcastToClients(tokens[mint]);
    }
}
setInterval(refreshTokenPrices, 30000);

async function start() {
    ourBalance = (await getPDA()) * 1e6;
    console.log('Our balance: ' + ourBalance);
    await listenToWallets(wallet_address);
}

start();

export { tokens };
