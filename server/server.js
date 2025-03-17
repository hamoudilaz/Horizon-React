import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PublicKey } from '@solana/web3.js';
import { wallet, getBalance } from './panelTest.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { swap } from './execute.js';
import { tokens, refreshTokenPrices } from './websocket.js';

const fastify = Fastify({ logger: false });

fastify.register(cors);

let SOL = 'So11111111111111111111111111111111111111112';
let PDA = '49atitTx1rNyvNRvvSe23e5FqvxCejWLxgbamRuXjkqH';

function getATA(outputMint) {
    return getAssociatedTokenAddressSync(new PublicKey(outputMint), wallet.publicKey);
}

fastify.post('/buy', async (request, reply) => {
    try {
        let { mint, amount, slippage, fee } = request.body;
        const ATA = getATA(mint).toBase58();
        amount = amount * 1e9;
        fee = fee * 1e9;
        slippage = slippage * 100;

        if (!mint || !amount || !slippage) {
            console.log('Missing data');
            return reply.status(400).send({ status: '400', error: `Invalid request, ${!mint ? 'mint' : !amount ? 'amount' : 'slippage'} is missing` });
        }

        const start = Date.now();

        const txid = await swap(SOL, mint, amount, ATA, slippage, fee);

        const end = Date.now() - start;
        if (!txid.result) {
            return reply.status(400).send({ status: '400', error: `${txid}` });
        } else return reply.status(200).send({ message: `https://solscan.io/tx/${txid.result}`, end });
    } catch (err) {
        console.error('Server error:', err);
        return reply.status(500).send({
            status: '500',
            error: 'Internal Server Error',
            details: err.message,
        });
    }
});


fastify.post('/sell', async (request, reply) => {
    try {
        let { outputMint, amount, fee } = request.body;

        if (!outputMint || !amount || !fee) {
            console.log('Missing data');
            return reply.status(400).send({ status: '400', error: `Invalid request, ${!outputMint ? 'outputMint' : !amount ? 'amount' : 'fee'} is missing` });
        }
        const { amountToSell, decimals } = await getBalance(outputMint);
        fee = fee * 1e9;
        console.log(amountToSell, decimals);
        const sellAmount = Math.floor((amountToSell * amount) / 100) * Math.pow(10, decimals);
        console.log(sellAmount);
        const start = Date.now();

        const txid = await swap(outputMint, SOL, sellAmount, PDA, 2700, fee);

        const end = Date.now() - start;

        if (!txid.result) {
            return reply.status(400).send({ status: '400', error: `${txid}` });
        } else return reply.status(200).send({ message: `https://solscan.io/tx/${txid.result}`, end });
    } catch (err) {
        console.error('Server error:', err);
        return reply.status(500).send({
            status: '500',
            error: 'Internal Server Error',
            details: err.message,
        });
    }
});

fastify.get('/api/holdings', async (request, reply) => { });

fastify.get('/api/tokens', async (request, reply) => {
    reply.send(Object.values(tokens));
});

fastify.get('/api/balance/', async (request, reply) => {
    await refreshTokenPrices();
    return reply.send({ tokens });
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: 'localhost' });
        console.log('🚀 Server running on http://localhost:3000');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
