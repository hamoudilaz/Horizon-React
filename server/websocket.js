import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { getOwnBalance, totalOwned, tokenLogo } from './helpers/helper.js';
import WebSocket from 'ws';

let wss;

export function setupWebSocket(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Frontend WebSocket client connected');

        ws.on('close', () => {
            console.log('Frontend WebSocket client disconnected');
        });

        ws.on('message', (message) => {
            console.log('Received from frontend:', message);
        });
    });
}

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

                if (changedMint === solMint) {

                    ourBalance = balance.toFixed(2);

                } else {
                    otherMint = changedMint;
                    tokenBalance = balance.toFixed(2);

                    if (tokenBalance >= 3) {
                        const logoData = await tokenLogo(otherMint) || {};
                        const { logoURI = "Not found", symbol = "Not found" } = logoData;

                        const totalTokenValue = await totalOwned(otherMint, tokenBalance);
                        tokens[otherMint] = {
                            listToken: true,
                            tokenMint: otherMint,
                            tokenBalance,
                            usdValue: totalTokenValue || NaN,
                            logoURI,
                            symbol,

                        };
                        broadcastToClients(tokens[otherMint]);
                    } else {
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
        broadcastToClients(tokens[mint]);
    }
}
setInterval(refreshTokenPrices, 30000);

export async function start(wallet) {
    try {
        ourBalance = (await getOwnBalance()) * 1e6;

        await listenToWallets(wallet);
    } catch (error) {
        console.error('start error:', error.message);
    }
}



export { tokens };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



/* export async function retrieveWalletStateWithTotal(wallet_address) {
    try {
        const filters = [
            { dataSize: 165 },
            { memcmp: { offset: 32, bytes: wallet_address } },
        ];
        const accounts = await connection.getParsedProgramAccounts(
            new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
            { filters }
        );
        const results = {};

        // Process SPL tokens
        accounts.forEach((account) => {
            const parsedAccountInfo = account.account.data;
            const mintAddress = parsedAccountInfo['parsed']['info']['mint'];
            const tokenBalance = parsedAccountInfo['parsed']['info']['tokenAmount']['uiAmount'];
            results[mintAddress] = {
                balance: tokenBalance,
                total: 0
            };
        });

        // Add SOL balance
        const solBalance = await connection.getBalance(new PublicKey(wallet_address));
        const solMintAddress = 'So11111111111111111111111111111111111111112';
        results['SOL'] = {
            balance: solBalance / 10 ** 9,
            total: 0
        };

        const mintsToFetch = Object.keys(results).map(mint =>
            mint === 'SOL' ? solMintAddress : mint
        );
        const priceResponse = await fetch(`https://api.jup.ag/price/v2?ids=${mintsToFetch.join(',')}`);
        const priceData = await priceResponse.json();

        const transformedResults = [];

        for (const mint of Object.keys(results)) {
            const effectiveMint = mint === 'SOL' ? solMintAddress : mint;
            const priceInfo = priceData.data[effectiveMint];



            const { logoURI, symbol } = await tokenLogo(mint);



            const totalTokenValue = await totalOwned(mint, results[mint].balance);


            let token = {
                tokenMint: mint,
                tokenBalance: results[mint].balance,
                usdValue: totalTokenValue,
                logoURI: logoURI || "No logo",
                symbol: symbol || "No logo"
            };


            if (priceInfo) {
                const price = parseFloat(priceInfo.price);
                token.total = Number((token.balance * price).toFixed(5));
            } else {
                token.total = null;
            }

            transformedResults.push(token);


        }




        broadcastToClients(transformedResults)
        return transformedResults;
    } catch (e) {
        console.error('bad wallet state:', e);
        throw e;
    }
}
 */
export { wss };
