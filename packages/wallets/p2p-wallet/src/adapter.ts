import {
    BaseSignerWalletAdapter,
    pollUntilReady,
    WalletAccountError,
    WalletNotConnectedError,
    WalletNotFoundError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import {PublicKey, Transaction} from '@solana/web3.js';
import {P2PWalletApi, setupP2PApi} from "./p2p-wallet-api";

export interface P2PConfiguration {
    pollInterval?: number;
    pollCount?: number;
}

export class P2PWalletAdapter extends BaseSignerWalletAdapter {
    private _p2pWallet: P2PWalletApi | null;
    private _connecting: boolean = false

    constructor(config: P2PConfiguration = {}) {
        super();

        this._p2pWallet = setupP2PApi()
        if (!this.ready) pollUntilReady(this, config.pollInterval || 1000, config.pollCount || 3);
    }

    get publicKey(): PublicKey | null {
        const publicKey = this._p2pWallet?.getPublicKey()
        if (publicKey) return new PublicKey(publicKey);
        return null
    }

    get ready(): boolean {
        return this._p2pWallet != null;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._p2pWallet?.getPublicKey();
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            this._connecting = true;

            const wallet = this._p2pWallet;
            if (!wallet) throw new WalletNotFoundError();
            this._p2pWallet = wallet

            try {
                await wallet.connect()
            } catch (e) {
                throw new WalletAccountError(undefined, e);
            }
            this.emit('connect');
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (this._p2pWallet) {
            await this._p2pWallet.disconnect();
        }

        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._p2pWallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const sign = await wallet.signTransaction(transaction);
                transaction.addSignature(new PublicKey(wallet.getPublicKey()!), new Buffer(sign))
                return transaction
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            const wallet = this._p2pWallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                (await wallet.signAllTransactions(transactions)).forEach((sign, index) => {
                    transactions[index].addSignature(new PublicKey(wallet.getPublicKey()!), new Buffer(sign))
                })
                return transactions
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
