# Testing OKX Wallet Connection

## How to Test

1. **Make sure OKX Wallet is installed**
   - Chrome: https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge
   - Edge: https://microsoftedge.microsoft.com/addons/detail/okx-wallet/pbpjkcldjiffchgbbndmhojiacbgflha
   - **Important:** Restart your browser after installing

2. **Disable other wallets (optional but recommended)**
   - If you have MetaMask or other wallets, disable them temporarily
   - This ensures OKX Wallet is the primary injected provider

3. **Start the app**
   ```bash
   npm run dev
   ```

4. **Open browser console** (F12) and check:
   ```javascript
   // Check if OKX Wallet is detected
   console.log('OKX Wallet:', window.okxwallet);
   console.log('Ethereum:', window.ethereum);
   console.log('Is OKX:', window.ethereum?.isOkxWallet);
   ```

5. **Click "Connect Wallet"**
   - Look for "Injected" or "Browser Wallet" option
   - This will automatically use OKX Wallet if it's installed
   - Click on it to connect

## Troubleshooting

### OKX Wallet not showing in list
- **Check installation:** Make sure OKX Wallet extension is installed and enabled
- **Refresh page:** Sometimes the extension needs a page refresh to inject properly
- **Check console:** Look for any errors in browser console
- **Try incognito:** Test in incognito mode to rule out extension conflicts

### "OKX Wallet not installed" error
- Install the extension from the links above
- Restart your browser after installation
- Make sure the extension is enabled in your browser's extension settings

### OKX shows but won't connect
- **Unlock wallet:** Make sure OKX Wallet is unlocked
- **Check network:** OKX might be on a different network
- **Clear cache:** Try clearing browser cache and reloading

### Multiple wallets installed
If you have both MetaMask and OKX installed:
- OKX Wallet should appear as a separate option in the list
- Each wallet will show with its own icon and name
- You can choose which one to connect with

## What Should Happen

1. Click "Connect Wallet"
2. Modal opens showing wallet options
3. Look for "Injected" or "Browser Wallet" option
4. Click on it
5. OKX Wallet extension popup appears
6. Approve connection
7. If not on Hardhat network, approve network addition
8. Connected!

## Why "Injected" instead of "OKX Wallet"?

RainbowKit's default configuration detects injected wallets automatically. When you click "Injected", it will use whichever wallet extension is active in your browser (OKX, MetaMask, etc.). This is actually more reliable than custom connectors.

## Debug Info

If OKX Wallet still doesn't work, run this in console:

```javascript
// Check what's available
console.log({
  hasOKXWallet: !!window.okxwallet,
  hasEthereum: !!window.ethereum,
  isOKX: window.ethereum?.isOkxWallet,
  isMetaMask: window.ethereum?.isMetaMask,
  providers: window.ethereum?.providers,
});
```

This will show you what wallet providers are detected.

## Expected Console Output

When OKX Wallet is properly installed:
```
{
  hasOKXWallet: true,
  hasEthereum: true,
  isOKX: true,
  isMetaMask: false,
  providers: undefined or [...]
}
```

## Still Not Working?

1. **Restart browser** after installing OKX Wallet
2. **Disable other wallets** temporarily to test
3. **Check extension permissions** - make sure OKX has permission to access the site
4. **Try a different browser** to isolate the issue
5. **Check OKX Wallet version** - make sure it's up to date

## Alternative: Use Injected Wallet

If OKX Wallet still doesn't appear as a separate option, you can use the "Injected" wallet option which will automatically detect OKX Wallet if it's the active injected provider.
