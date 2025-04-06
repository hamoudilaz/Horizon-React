import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { swap } from '../execute.js';
const connection = new Connection(process.env.RPC_URL, {
    wsEndpoint: process.env.WSS_SHYFT,
    commitment: 'confirmed',
});

let solMint;
let otherMint;

export async function listenToWallets(wallet) {
    try {
        connection.onProgramAccountChange(
            TOKEN_PROGRAM_ID,
            async (data) => {
                const changedMint = AccountLayout.decode(data.accountInfo.data).mint.toBase58();
                console.log(changedMint);
                if (changedMint === solMint) {
                    console.log('SOL mint: ', changedMint);
                } else {
                    otherMint = changedMint;
                    console.log('Other mint: ', otherMint);
                }

                console.log('Wallet state changed');
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

listenToWallets('4TJVWEFXqKL6gTCzhZ8mU4gzD6Zff6PQRFPK7wPvuo4e');
