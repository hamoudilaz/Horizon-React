import Client, { CommitmentLevel, SubscribeRequest } from '@triton-one/yellowstone-grpc';
import * as bs58 from 'bs58';
import { txid } from './decod.js';
import { wss } from '../websocket.js';
import dotenv from "dotenv"
dotenv.config()


class GrpcStreamManager {
    constructor(endpoint, authToken, dataHandler) {
        this.client = new Client(endpoint, authToken, { 'grpc.max_receive_message_length': 64 * 1024 * 1024 });
        this.stream = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectInterval = 5000;
        this.dataHandler = dataHandler;
    }

    async connect(subscribeRequest) {
        try {
            this.stream = await this.client.subscribe();
            this.isConnected = true;
            this.reconnectAttempts = 0;

            this.stream.on('data', this.handleData.bind(this));
            this.stream.on('error', this.handleError.bind(this));
            this.stream.on('end', () => this.handleDisconnect(subscribeRequest));
            this.stream.on('close', () => this.handleDisconnect(subscribeRequest));

            await this.write(subscribeRequest);
            this.startPing();
        } catch (error) {
            console.error('Connection error:', error);
            await this.reconnect(subscribeRequest);
        }
    }

    async write(req) {
        return new Promise((resolve, reject) => {
            this.stream.write(req, (err) => (err ? reject(err) : resolve()));
        });
    }

    async reconnect(subscribeRequest) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

        setTimeout(async () => {
            try {
                await this.connect(subscribeRequest);
            } catch (error) {
                console.error('Reconnection failed:', error);
                await this.reconnect(subscribeRequest);
            }
        }, this.reconnectInterval * Math.min(this.reconnectAttempts, 5));
    }

    startPing() {
        setInterval(() => {
            if (this.isConnected) {
                this.write({
                    ping: { id: 1 },
                    accounts: {},
                    accountsDataSlice: [],
                    transactions: {},
                    blocks: {},
                    blocksMeta: {},
                    entry: {},
                    slots: {},
                    transactionsStatus: {},
                }).catch(console.error);
            }
        }, 30000);
    }

    handleData(data) {
        try {
            const processed = this.processBuffers(data);
            this.dataHandler(processed);
        } catch (error) {
            console.error('Error processing data:', error);
        }
    }

    handleError(error) {
        console.error('Stream error:', error);
        this.isConnected = false;
    }

    handleDisconnect(subscribeRequest) {
        console.log('Stream disconnected');
        this.isConnected = false;
        this.reconnect(subscribeRequest);
    }

    processBuffers(obj) {
        if (!obj) return obj;
        if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) {
            return bs58.default.encode(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.processBuffers(item));
        }
        if (typeof obj === 'object') {
            return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, this.processBuffers(v)]));
        }
        return obj;
    }
}

// Transaction monitoring implementation
export async function monitorTransactions(wallet) {
    const manager = new GrpcStreamManager(
        process.env.GRPC_URL,
        process.env.GRPC_TOKEN,
        (data) => handleTransactionUpdate(data, wallet)
    );

    // Create subscription request for monitoring program transactions
    const subscribeRequest = {
        transactions: {
            client: {
                accountInclude: [wallet],
                accountExclude: [],
                accountRequired: [],
                vote: false,
                failed: false,
            },
        },
        commitment: CommitmentLevel.CONFIRMED,
        accounts: {},
        accountsDataSlice: [],
        blocks: {},
        blocksMeta: {},
        entry: {},
        slots: {},
        transactionsStatus: {},
    };

    await manager.connect(subscribeRequest);
}

async function handleTransactionUpdate(data, wallet) {
    if (data?.transaction?.transaction) {
        const tx = data.transaction.transaction
        const res = await txid(tx, wallet)
        console.log(res)

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    copy: true,
                    payload: res
                }));
            }
        });
    }
}


