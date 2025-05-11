import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getBalance, loadKey } from './panelTest.js';
import { swap } from './execute.js';
import { getATA, getPDA } from './helpers/helper.js';
import { tokens, refreshTokenPrices, start, retrieveWalletStateWithTotal } from './websocket.js';
import { setupWebSocket } from './websocket.js';
import { main, stopCopy } from './copy/index.js';
import dotenv from 'dotenv';
import { swapNoz } from './nozomi.js';
dotenv.config();

const fastify = Fastify({ logger: false });

fastify.register(cors, {
    origin: process.env.FRONTEND_URL_CORS,
});

let SOL = 'So11111111111111111111111111111111111111112';
export let PDA

fastify.post('/buy', async (request, reply) => {
    const start = Date.now();
    try {
        let { mint, amount, slippage, fee, jitoFee, node } = request.body;

        const mintATA = getATA(mint);

        if (mintATA.error) throw new Error(mintATA.error);
        const ATA = mintATA?.toBase58();

        if (!mint || !amount || !slippage) {
            return reply.status(400).send({ status: '400', error: `Invalid request, ${!mint ? 'mint' : !amount ? 'amount' : 'slippage'} is missing` });
        }
        let execute = node ? swapNoz : swap

        let txid = await execute(SOL, mint, amount * 1e9, ATA, slippage * 100, fee * 1e10, jitoFee * 1e9);

        if (txid?.limit) {
            console.log("rate limit activated on return")
            return reply.status(429).send({ limit: true, error: `${txid?.limit}` });
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
        let { outputMint, amount, fee, jitoFee, node } = request.body;

        if (!outputMint || !amount || !fee) {
            return reply.status(400).send({ status: '400', error: `Invalid request, ${!outputMint ? 'outputMint' : !amount ? 'amount' : 'fee'} is missing` });
        }
        const amountToSell = await getBalance(outputMint);

        const sellAmount = Math.floor((amountToSell * amount) / 100)
        const time = Date.now();



        let execute = node ? swapNoz : swap

        const txid = await execute(outputMint, SOL, sellAmount, PDA, 2700, fee * 1e9, jitoFee * 1e9);

        const end = Date.now() - time;
        if (txid.limit) {
            return reply.status(429).send({ status: '429', error: `${txid}` });

        }

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


fastify.get('/fullinfo/:wallet', async (request, reply) => {
    const { wallet } = request.params;

    // const data = await retrieveWalletStateWithTotal(wallet);
    // return reply.send({ message: data });

});



fastify.post('/api/copytrade', async (request, reply) => {
    console.log("starting copy....")
    const data = await main(request.body);
    if (data.error) return reply.send({ error: `Copying wallet failed`, error: data.error });

    return reply.send({ message: `Copying ${request.body.target}` });
});


fastify.get('/api/stopcopy', async () => {
    console.log("STOPPING copy....")

    stopCopy()
    return reply.send({ message: "copy trade stopped" });
});

fastify.get('/stop', async () => {
    console.log("STOPPING copy....")

    return reply.send({ message: "copy trade stopped" });
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
