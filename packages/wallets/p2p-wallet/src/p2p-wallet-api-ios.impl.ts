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

class Channel {
    private rawChannel: RawChannel

    constructor(rawChannel: RawChannel) {
        this.rawChannel = rawChannel
    }

    connect(): Promise<string> {
        return this.rawChannel.postMessage<string>(null)
    }

    /**
     * Sign the transaction
     * @param transaction The transaction, that will be signed
     * @return Signature
     */
    signTransaction(transaction: Transaction): Promise<string> {
        return this.rawChannel.postMessage<string>(transaction)
    }

    /**
     * Sign the transaction
     * @param transactions The list of transaction, that will be signed
     * @return Signature
     */
    signTransactions(transactions: Transaction[]): Promise<string[]> {
        return this.rawChannel.postMessage<string[]>(transactions)
    }
}

export class P2PWalletApiIosImpl implements P2PWalletApi {
    private channel: Channel
    public publicKey: PublicKey | null = null

    constructor() {
        // @ts-ignore
        const rawChannel = window.webkit.messageHandlers.P2PWalletApi
        this.channel = new Channel(rawChannel)
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
