import { handleTxFast } from './index.js';
import dotenv from 'dotenv';
import Client from '@triton-one/yellowstone-grpc';
import * as bs58 from 'bs58';

dotenv.config();

class GrpcStreamManager {
    constructor(endpoint, authToken, dataHandler) {
        this.client = new Client(endpoint, authToken, {
            'grpc.max_receive_message_length': 64 * 1024 * 1024,
            'grpc.keepalive_time_ms': 60000,
            'grpc.keepalive_timeout_ms': 20000,
            'grpc.keepalive_permit_without_calls': 1,
            'grpc.initial_reconnect_backoff_ms': 100,
            'grpc.max_reconnect_backoff_ms': 1000,
            'grpc.use_local_subchannel_pool': 1,
            'grpc.enable_retries': 0,
            'grpc.retry_buffer_size': 0,
            'grpc.per_rpc_retry_buffer_size': 0,
            'grpc-node.flow_control_window': 8 * 1024 * 1024,
            'grpc-node.max_session_memory': 32 * 1024 * 1024,
        });

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

const GRPC_URL = process.env.GRPC;
const GRPC_TOKEN = process.env.TOKEN;

export async function grpcStream(wallet) {
    const manager = new GrpcStreamManager(GRPC_URL, GRPC_TOKEN, (data) => handleTransactionUpdate(data, wallet));

    const subscribeRequest = {
        transactions: {
            client: {
                accountInclude: [wallet],
                accountExclude: [],
                accountRequired: [],
                vote: false,
                failed: false,
                signature: undefined,
            },
        },
        commitment: 0,
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
        const tx = data.transaction.transaction;

        await handleTxFast(tx, wallet, 'grpc');
    }
}
