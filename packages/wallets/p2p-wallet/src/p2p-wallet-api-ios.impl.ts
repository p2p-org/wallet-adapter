import {PublicKey, Transaction} from "@solana/web3.js";
import {P2PWalletApi} from "./p2p-wallet-api";
import {WalletAccountError, WalletNotConnectedError} from "@solana/wallet-adapter-base";
import {v4 as uuid} from 'uuid';

/**
 * Expose the window
 */
interface P2PWindow extends Window {
    webkit?: {
        messageHandlers: {
            P2PWalletIncomingChannel: IncomingChannel
            P2PWalletOutgoingChannel: OutgoingChannel
        }
    }
    p2pWallet?: P2PWalletApi
}

/**
 * Expose channel between iOS and browser
 */
interface IncomingChannel {
    postMessage(args: any): void
}

interface OutgoingChannel {
    accept(message: Message): void
}

interface Message {
    id: string
    method: string | undefined
    args: any
}

export class Completer<T> {
    public readonly promise: Promise<T>;
    public complete!: (value: (PromiseLike<T> | T)) => void;
    public reject!: (reason?: any) => void;
    public readonly timeoutId: ReturnType<typeof setTimeout>

    public constructor(onTimeout: (completer: Completer<T>) => void, timeout: number = 60) {
        this.promise = new Promise<T>((resolve, reject) => {
            this.complete = resolve;
            this.reject = reject;
        })
        this.timeoutId = setTimeout(() => onTimeout(this), timeout * 1000)
    }

    close() {
        clearTimeout(this.timeoutId)
    }
}

class Channel {
    private dispatchCenter: Map<string, Completer<any>> = new Map<string, Completer<any>>()

    private get outgoingChannel(): IncomingChannel {
        return (window as P2PWindow).webkit!.messageHandlers.P2PWalletIncomingChannel
    }

    constructor() {
        (window as P2PWindow).webkit!.messageHandlers.P2PWalletOutgoingChannel.accept = this.accept
    }

    private call<T>(method: string, data: any): Promise<T> {
        const message: Message = {
            id: uuid(),
            method: 'connect',
            args: null,
        }

        const completer = new Completer<T>((completer) => {
            completer.reject("Timeout")
            this.dispatchCenter.delete(message.id)
        })

        this.dispatchCenter.set(message.id, completer)
        this.outgoingChannel.postMessage(message)
        return completer.promise
    }

    connect(): Promise<string> {
        return this.call<string>('connect', null)
    }

    /**
     * Sign the transaction
     * @param transaction The transaction, that will be signed
     * @return Signature
     */
    signTransaction(transaction: Transaction): Promise<string> {
        return this.call<string>('signTransaction', transaction)
    }

    /**
     * Sign the transaction
     * @param transactions The list of transaction, that will be signed
     * @return Signature
     */
    signTransactions(transactions: Transaction[]): Promise<string[]> {
        return this.call<string[]>('signTransactions', transactions)
    }

    /**
     * Incoming message from iOS will be handled here.
     * @param message
     */
    accept(message: Message) {
        const completer = this.dispatchCenter.get(message.id)
        if (completer == null) return

        if (message.method == 'error') {
            completer.reject(message.args)
        } else {
            completer.complete(message.args)
        }

        completer.close()
        this.dispatchCenter.delete(message.id)
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
            console.log("Connecting");
            this.publicKey = new PublicKey(await this.channel.connect())
            console.log(new PublicKey(await this.channel.connect()));
        } catch (e) {
            console.log("Connect error");
            throw new WalletAccountError(undefined, e)
        }
    }

    async disconnect(): Promise<void> {
        this.publicKey = null
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

    static isReady(): boolean {
        // @ts-ignore
        console.log(window.webkit.messageHandlers.P2PWalletApi != null)

        // @ts-ignore
        return window.webkit.messageHandlers.P2PWalletApi != null
    }
}
