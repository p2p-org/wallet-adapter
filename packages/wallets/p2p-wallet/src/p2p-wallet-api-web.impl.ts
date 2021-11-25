import {P2PWalletApi} from "./p2p-wallet-api";
import {PublicKey, Transaction} from "@solana/web3.js";

export class P2PWalletApiWebImpl implements P2PWalletApi {
    connect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    getPublicKey(): PublicKey | null {
        return null;
    }

    signAllTransactions(transaction: Transaction[]): Promise<string[]> {
        return Promise.resolve([]);
    }

    signTransaction(transaction: Transaction): Promise<string> {
        return Promise.resolve("");
    }

}
