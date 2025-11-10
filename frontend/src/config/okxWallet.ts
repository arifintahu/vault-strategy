import type { Wallet } from '@rainbow-me/rainbowkit';
import { injected } from 'wagmi/connectors';

export interface OKXWalletOptions {
  projectId?: string;
}

export const okxWallet = (): Wallet => ({
  id: 'okx',
  name: 'OKX Wallet',
  iconUrl: 'https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png',
  iconBackground: '#000',
  downloadUrls: {
    browserExtension: 'https://www.okx.com/web3',
    chrome: 'https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge',
    edge: 'https://microsoftedge.microsoft.com/addons/detail/okx-wallet/pbpjkcldjiffchgbbndmhojiacbgflha',
  },
  mobile: {
    getUri: (uri: string) => uri,
  },
  qrCode: {
    getUri: (uri: string) => uri,
    instructions: {
      learnMoreUrl: 'https://www.okx.com/web3',
      steps: [
        {
          description: 'We recommend putting OKX Wallet on your home screen for faster access.',
          step: 'install',
          title: 'Open the OKX Wallet app',
        },
        {
          description: 'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
          step: 'create',
          title: 'Create or Import a Wallet',
        },
        {
          description: 'After you scan, a connection prompt will appear for you to connect your wallet.',
          step: 'scan',
          title: 'Tap the scan button',
        },
      ],
    },
  },
  extension: {
    instructions: {
      learnMoreUrl: 'https://www.okx.com/web3',
      steps: [
        {
          description: 'We recommend pinning OKX Wallet to your taskbar for quicker access to your wallet.',
          step: 'install',
          title: 'Install the OKX Wallet extension',
        },
        {
          description: 'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
          step: 'create',
          title: 'Create or Import a Wallet',
        },
        {
          description: 'Once you set up your wallet, click below to refresh the browser and load up the extension.',
          step: 'refresh',
          title: 'Refresh your browser',
        },
      ],
    },
  },
  createConnector: () => {
    return injected({
      shimDisconnect: true,
      target: {
        id: 'okx',
        name: 'OKX Wallet',
        provider(window) {
          if (!window) return undefined;
          
          const win = window as any;
          
          // Priority 1: Check for dedicated okxwallet object
          if (win.okxwallet) {
            return win.okxwallet;
          }
          
          // Priority 2: Check if ethereum provider is OKX
          if (win.ethereum?.isOkxWallet) {
            return win.ethereum;
          }
          
          // Priority 3: Check in providers array (when multiple wallets installed)
          if (win.ethereum?.providers) {
            const okx = win.ethereum.providers.find((p: any) => p.isOkxWallet);
            if (okx) return okx;
          }
          
          return undefined;
        },
      },
    });
  },
});

declare global {
  interface Window {
    okxwallet?: any;
  }
}
