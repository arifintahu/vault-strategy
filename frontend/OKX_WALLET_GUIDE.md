# OKX Wallet Connection Guide

## Quick Start

1. **Install OKX Wallet**
   - [Chrome Web Store](https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge)
   - [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/okx-wallet/pbpjkcldjiffchgbbndmhojiacbgflha)

2. **Restart your browser** after installation

3. **Open the app** and click "Connect Wallet"

4. **Click "Injected"** or "Browser Wallet" option

5. **Approve** in OKX Wallet popup

6. **Done!** You're connected

## If You Have Multiple Wallets

If you have both OKX Wallet and MetaMask (or other wallets) installed:

### Option 1: Disable Other Wallets (Recommended)
1. Go to browser extensions (chrome://extensions or edge://extensions)
2. Temporarily disable MetaMask or other wallets
3. Refresh the page
4. Connect using "Injected" option

### Option 2: Set OKX as Default
1. Open OKX Wallet settings
2. Look for "Default Wallet" or "Set as Default" option
3. Enable it
4. Refresh the page
5. Connect using "Injected" option

### Option 3: Use OKX's Built-in Browser
1. Open OKX Wallet app
2. Use the built-in DApp browser
3. Navigate to your app URL
4. Connect directly

## Troubleshooting

### "Injected" option doesn't appear
- **Solution:** Make sure OKX Wallet extension is installed and enabled
- Check: Go to browser extensions and verify OKX Wallet is active
- Try: Restart your browser

### Connection fails or shows "Retry"
- **Solution 1:** Refresh the page and try again
- **Solution 2:** Disconnect from OKX Wallet settings, then reconnect
- **Solution 3:** Clear browser cache and cookies
- **Solution 4:** Restart browser

### OKX Wallet popup doesn't appear
- **Solution:** Check if popup is blocked
- Look for a popup blocker icon in address bar
- Allow popups for this site
- Try clicking "Injected" again

### Wrong wallet connects (MetaMask instead of OKX)
- **Solution:** Disable MetaMask extension temporarily
- Or: Set OKX as default wallet in OKX settings
- Or: Disconnect MetaMask first, then connect with OKX

### Network error or "Wrong Network"
- **Solution:** Click "Switch to Hardhat Network" button
- OKX will prompt you to add the network
- Approve the network addition
- Network details:
  - Network Name: Hardhat Local
  - RPC URL: http://127.0.0.1:8545
  - Chain ID: 31337
  - Currency Symbol: ETH

## Verify OKX Wallet is Detected

Open browser console (F12) and run:

```javascript
console.log({
  okxInstalled: !!window.okxwallet,
  ethereumExists: !!window.ethereum,
  isOKX: window.ethereum?.isOkxWallet,
  walletName: window.ethereum?.isOkxWallet ? 'OKX' : 
              window.ethereum?.isMetaMask ? 'MetaMask' : 
              'Unknown'
});
```

**Expected output when OKX is active:**
```javascript
{
  okxInstalled: true,
  ethereumExists: true,
  isOKX: true,
  walletName: 'OKX'
}
```

## Still Not Working?

1. **Completely restart browser** (close all windows)
2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete
   - Edge: Ctrl+Shift+Delete
   - Clear "Cached images and files"
3. **Reinstall OKX Wallet extension**
4. **Try a different browser** to isolate the issue
5. **Check OKX Wallet version** - update if needed

## Alternative: Direct Connection

If RainbowKit connection doesn't work, you can connect directly:

```javascript
// In browser console
const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});
console.log('Connected:', accounts[0]);
```

If this works, the issue is with RainbowKit configuration, not OKX Wallet.

## Need Help?

- Check OKX Wallet is unlocked
- Ensure Hardhat node is running: `npx hardhat node`
- Verify contracts are deployed: `npm run setup`
- Check browser console for errors
- Try incognito/private mode to rule out extension conflicts
