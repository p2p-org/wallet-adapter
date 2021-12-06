import {P2PWalletApi} from "./p2p-wallet-api";
import {PublicKey, Transaction} from "@solana/web3.js";

export class P2pWalletApiAndroidImpl implements P2PWalletApi {
    connect(): Promise<void> {
        return Promise.resolve(undefined);
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
