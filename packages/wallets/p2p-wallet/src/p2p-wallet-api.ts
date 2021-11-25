import {PublicKey, Transaction} from "@solana/web3.js";
import {P2PWalletApiIosImpl} from "./p2p-wallet-api-ios.impl";
import {P2pWalletApiAndroidImpl} from "./p2p-wallet-api-android.impl";
import {P2PWalletApiWebImpl} from "./p2p-wallet-api-web.impl";

export interface P2PWalletApi {

    /**
     * Establish the connection between host and dApp.
     * Throw error if connection can't be established
     */
    connect(): Promise<void>

    /**
     * Disconnect the current wallet (account).
     * Free the resource
     */
    disconnect(): Promise<void>

    /**
     * Get wallet address (SOL)
     */
    getPublicKey(): PublicKey | null

    /**
     * Sign the requested transaction
     * @param transaction
     */
    signTransaction(transaction: Transaction): Promise<string>

    /**
     * Sign the requested transactions
     * @param transaction
     */
    signAllTransactions(transaction: Transaction[]): Promise<string[]>
}

export interface P2PWindow extends Window {
    p2pTarget?: string
    p2pWallet?: P2PWalletApi
}

export declare const window: P2PWindow;

export function setupP2PApi() {
    window.p2pWallet = undefined

    const target = window.p2pTarget
    switch (target) {
        case "ios":
            window.p2pWallet = new P2PWalletApiIosImpl()
            break
        case "android":
            window.p2pWallet = new P2pWalletApiAndroidImpl()
            break
        default:
            window.p2pWallet = new P2PWalletApiWebImpl()
    }
}
