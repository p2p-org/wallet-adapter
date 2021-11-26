import {PublicKey, Transaction} from "@solana/web3.js";
import {P2PWalletApi} from "./p2p-wallet-api";
import {WalletAccountError, WalletNotConnectedError} from "@solana/wallet-adapter-base";

/**
 * Use to describe a return value in [Channel.postMessage].
 */
type Void = null

/**
 * Expose channel between iOS and browser
 */
interface RawChannel {
    postMessage<T>(args: any): Promise<T>
}

interface Message {
    method: string
    args: any
}

class Channel {
    private getRawChannel(): RawChannel {
        // @ts-ignore
        return window.webkit.messageHandlers.P2PWalletApi
    }

    connect(): Promise<string> {
        const message: Message = {
            method: 'connect',
            args: null,
        }
        return this.getRawChannel().postMessage<string>(message)
    }

    /**
     * Sign the transaction
     * @param transaction The transaction, that will be signed
     * @return Signature
     */
    signTransaction(transaction: Transaction): Promise<string> {
        const message: Message = {
            method: 'signTransaction',
            args: transaction,
        }
        return this.getRawChannel().postMessage<string>(message)
    }

    /**
     * Sign the transaction
     * @param transactions The list of transaction, that will be signed
     * @return Signature
     */
    signTransactions(transactions: Transaction[]): Promise<string[]> {
        const message: Message = {
            method: 'signTransactions',
            args: transactions,
        }
        return this.getRawChannel().postMessage<string[]>(message)
    }
}

export class P2PWalletApiIosImpl implements P2PWalletApi {
    private channel: Channel
    public publicKey: PublicKey | null = null

    constructor() {
        // @ts-ignore
        this.channel = new Channel()
    }

    async connect(): Promise<void> {
        try {
            this.publicKey = new PublicKey(await this.channel.connect())
        } catch (e) {
            throw new WalletAccountError(undefined, e)
        }

        return Promise.resolve(undefined);
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    getPublicKey(): PublicKey | null {
        return this.publicKey
    }

    signAllTransactions(transactions: Transaction[]): Promise<string[]> {
        if (!this.publicKey) {
            throw new WalletNotConnectedError();
        }

        return this.channel.signTransactions(transactions)
    }

    signTransaction(transaction: Transaction): Promise<string> {
        if (!this.publicKey) {
            throw new WalletNotConnectedError();
        }

        return this.channel.signTransaction(transaction)
    }
}
