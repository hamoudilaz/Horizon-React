import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getBalance, loadKey } from './panelTest.js';
import { swap } from './execute.js';
import { getATA, getPDA } from './helpers/helper.js';
import { tokens, refreshTokenPrices, start, retrieveWalletStateWithTotal } from './websocket.js';
import { setupWebSocket } from './websocket.js'; // NEW
import { monitorTransactions } from './copy/listener.js';
import { settings } from './copy/copy-trade.js';
import dotenv from 'dotenv';
dotenv.config();

const fastify = Fastify({ logger: false });

fastify.register(cors, {
    origin: process.env.FRONTEND_URL_CORS,
});

let SOL = 'So11111111111111111111111111111111111111112';
export let PDA

fastify.post('/buy', async (request, reply) => {
    try {
        let { mint, amount, slippage, fee, jitoFee } = request.body;

        const mintATA = getATA(mint);

        if (mintATA.error) throw new Error(mintATA.error);
        const ATA = mintATA.toBase58();

        if (!mint || !amount || !slippage) {
            return reply.status(400).send({ status: '400', error: `Invalid request, ${!mint ? 'mint' : !amount ? 'amount' : 'slippage'} is missing` });
        }

        const start = Date.now();

        let txid = await swap(SOL, mint, amount * 1e9, ATA, slippage * 100, fee * 1e9, jitoFee * 1e9);

        if (typeof txid === 'string' && txid.startsWith('Retry')) {
            for (let i = 0; i < 5; i++) {
                txid = await swap(SOL, mint, amount * 1e9, ATA, slippage * 100, fee * 1e9, jitoFee * 1e9);
                if (!txid?.error) break;
            }
        }

        if (!txid.result) {
            return reply.status(400).send({ status: '400', error: `${txid}` });
        }
        const end = Date.now() - start;

        return reply.status(200).send({ message: `https://solscan.io/tx/${txid.result}`, end });
    } catch (err) {
        return reply.status(500).send({ status: '500', error: `Internal Server Error: ${err.message}`, details: err.message });
    }
});

fastify.post('/sell', async (request, reply) => {
    try {
        let { outputMint, amount, fee, jitoFee } = request.body;

        if (!outputMint || !amount || !fee) {
            return reply.status(400).send({ status: '400', error: `Invalid request, ${!outputMint ? 'outputMint' : !amount ? 'amount' : 'fee'} is missing` });
        }
        const { amountToSell, decimals } = await getBalance(outputMint);
        const sellAmount = Math.floor((amountToSell * amount) / 100) * Math.pow(10, decimals);
        const time = Date.now();

        const txid = await swap(outputMint, SOL, sellAmount, PDA, 2700, fee * 1e9, jitoFee * 1e9);

        const end = Date.now() - time;

        if (!txid.result) {
            return reply.status(400).send({ status: '400', error: `${txid}` });
        }

        return reply.status(200).send({ message: `https://solscan.io/tx/${txid.result}`, end });
    } catch (err) {
        console.error('Server error:', err);
        return reply.status(500).send({ status: '500', error: `Internal Server Error: ${err.message}`, details: err.message });
    }
});

fastify.get('/api/tokens', async (request, reply) => {
    reply.send(Object.values(tokens));
});

fastify.get('/api/balance/', async (request, reply) => {
    await refreshTokenPrices();
    return reply.send({ tokens });
});

fastify.post('/api/loadKey', async (request, reply) => {
    try {
        const { key } = request.body;

        const pubKey = loadKey(key);
        if (!pubKey) {
            return reply.status(400).send({ status: '400', error: 'Invalid key' });
        }

        PDA = await getPDA(pubKey);

        await start(pubKey);
        return reply.send({ pubKey });
    } catch (err) {
        console.error(err);
        return reply.status(500).send({ status: '500', error: 'Server error' });
    }
});


/* fastify.get('/fullinfo/:wallet', async (request, reply) => {
    const { wallet } = request.params;

    const data = await retrieveWalletStateWithTotal(wallet);
}); */



fastify.post('/api/copytrade', async (request, reply) => {
    const { target } = request.body;
    settings(request.body)

    const data = await monitorTransactions(target);
    return reply.send({ message: `Copying ${target}`, swap: data });
});



const startServer = async () => {
    const port = 3000;

    try {
        await fastify.listen({ port, host: '0.0.0.0' });

        // Attach WebSocket AFTER Fastify is ready
        const httpServer = fastify.server;
        setupWebSocket(httpServer);

        console.log(`🚀 HTTP + WebSocket running on port ${port}`);
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
};

startServer();
