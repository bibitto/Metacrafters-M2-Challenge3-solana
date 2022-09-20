import React from 'react';
import logo from './logo.svg';
import './App.css';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useEffect, useState } from 'react';

type DisplayEncoding = 'utf8' | 'hex';

type PhantomEvent = 'disconnect' | 'connect' | 'accountChanged';
type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage';

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
const getProvider = (): PhantomProvider | undefined => {
  if ('solana' in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

function App() {
  const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);

  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(undefined);

  useEffect(() => {
    const provider = getProvider();
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  /**
   * @description prompts user to connect wallet if it exists.
   * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // checks if phantom wallet exists
    if (solana) {
      try {
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());
        // update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        console.log(err);
      }
    }
  };

  /**
   * @description prompts user to disconnect wallet if it exists.
   * This function is called when the disconnect wallet button is clicked
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (solana) {
      try {
        await solana.disconnect();
        setWalletKey(undefined);
        console.log('Disconnect Your Wallet!');
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header" style={{ justifyContent: 'normal' }}>
        <div style={{ marginTop: 16, marginLeft: '90vw' }}>
          {provider && !walletKey && (
            <button
              style={{
                fontSize: '16px',
                padding: '15px',
                fontWeight: 'bold',
                borderRadius: '5px',
              }}
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
          {provider && walletKey && (
            <button
              style={{
                fontSize: '16px',
                padding: '15px',
                fontWeight: 'bold',
                borderRadius: '5px',
              }}
              onClick={disconnectWallet}
            >
              Disconnect
            </button>
          )}
        </div>
        <h2 style={{ marginTop: '35vh' }}>Connect to Phantom Wallet</h2>
        {provider && walletKey && (
          <p style={{ fontSize: 16 }}>Current Address: {walletKey as any}</p>
        )}

        {!provider && (
          <p>
            No provider found. Install <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
      </header>
    </div>
  );
}

export default App;
