import {P2PWalletApi} from "./p2p-wallet-api";
import {PublicKey, Transaction} from "@solana/web3.js";

export class P2PWalletApiWebImpl implements P2PWalletApi {
    async connect(): Promise<void> {
        throw "P2PWalletApiWebImpl hasn't been implemented"
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    getPublicKey(): PublicKey | null {
        return null;
    }

    signAllTransactions(transaction: Transaction[]): Promise<Transaction[]> {
        return Promise.reject("Unimplemented");
    }

    signTransaction(transaction: Transaction): Promise<Transaction> {
        return Promise.reject("Unimplemented");
    }
}
