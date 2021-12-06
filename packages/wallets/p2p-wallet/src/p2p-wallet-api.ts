import {PublicKey, Transaction} from "@solana/web3.js";
import {P2PWalletApiIosImpl} from "./p2p-wallet-api-ios.impl";
import {P2pWalletApiAndroidImpl} from "./p2p-wallet-api-android.impl";
import {P2PWalletApiWebImpl} from "./p2p-wallet-api-web.impl";

export interface P2PWalletApi {

    /**
     * Establish the connection between host and dApp.
     */
    connect(): Promise<void>

    /**
     * Disconnect the current wallet (account).
     */
    disconnect(): Promise<void>

    /**
     * Get wallet address (SOL).
     */
    getPublicKey(): PublicKey | null

    /**
     * Sign the requested transaction.
     * @param transaction
     */
    signTransaction(transaction: Transaction): Promise<Transaction>

    /**
     * Sign the requested transactions.
     * @param transaction
     */
    signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>
}

declare const window: P2PWindow;

export interface P2PWindow extends Window {
    p2pTarget?: string
    p2pWallet?: P2PWalletApi
}

/**
 * Check the wallet is ready to connect.
 */
export function isP2PWalletReady(): boolean {
    const target = window.p2pTarget
    switch (target) {
        case "ios":
            return P2PWalletApiIosImpl.isReady()
        case "android":
            return false
        default:
            // Web flow
            return true
    }
}

/**
 * Setup p2p api. The object will be stored at `window.p2pWallet`
 */
export function initP2PWalletApi(): P2PWalletApi {
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

    return window.p2pWallet
}
