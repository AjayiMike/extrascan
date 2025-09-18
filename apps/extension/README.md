# Extrascan Browser Extension

The Extrascan browser extension enhances blockchain explorers by adding advanced contract interaction capabilities directly within block explorer websites like Etherscan and Blockscout.

## Overview

The extension adds an "Extrascan" tab to contract pages on block explorers, allowing you to:

- Interact with verified smart contracts
- Extrapolate and interact with unverified contract functions using AI
- Connect your Web3 wallet directly within the explorer
- Execute contract functions without leaving the explorer

## Tech Stack

- [Plasmo](https://www.plasmo.com/) - Browser extension framework
- [React](https://reactjs.org/) - UI library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [@extrascan/shared](../../packages/shared) - Shared components and utilities
- [Ethers.js](https://docs.ethers.org/v6/) - Ethereum library

## Development Setup

### Prerequisites

- Node.js >= 20.12.0
- pnpm >= 9.14.0

### Local Development

1. From the root directory, install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   # From root directory
   pnpm dev:extension

   # Or from extension directory
   pnpm dev
   ```

3. Load the extension in your browser:
   - Chrome/Edge: Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `apps/extension/build/chrome-mv3-dev` directory

### Extension Structure

```
src/
├── config/              # Extension configuration
│   └── eip6963.ts       # Wallet connection standards
├── contents/            # Content scripts
│   ├── components/      # Content script components
│   │   ├── ExtrascanTab.tsx    # Main extension tab component
│   │   ├── UniversalDapp.tsx   # Contract interaction component
│   │   └── WalletContext.tsx   # Wallet connection context
│   └── extrascan.tsx    # Main content script entry
├── hooks/               # Custom React hooks
│   └── useInitAppkit.ts # Wallet connection hook
├── popup/               # Extension popup UI
│   ├── Default.tsx      # Default popup view
│   ├── header.tsx       # Popup header
│   ├── index.tsx        # Popup entry point
│   └── Settings.tsx     # Settings view
├── style.css            # Global styles
└── utils/               # Utility functions
    └── storage.ts       # Extension storage utilities
```

## Building for Production

```bash
# From root directory
pnpm build:extension

# Or from extension directory
pnpm build
```

The build output will be in the `build/chrome-mv3-prod` directory.

## Packaging

To create a distributable package for the Chrome Web Store:

```bash
pnpm package
```

## Browser Compatibility

The extension currently supports:

- Google Chrome
- Microsoft Edge
- Other Chromium-based browsers

## Permissions

The extension requires the following permissions:

- `host_permissions`: Access to HTTPS websites (for interacting with block explorers)
- `clipboardRead`: Access to clipboard (for copying contract addresses)

## Supported Block Explorers

- Etherscan.io and its network variations (Sepolia, etc.)
- Support for Blockscout explorers coming soon

## Troubleshooting

### Common Issues

1. **Extension not appearing on contract pages**

   - Ensure the URL matches the supported patterns (currently etherscan.io/address/\* pages)
   - Try refreshing the page after extension installation

2. **Wallet connection issues**

   - Check if your wallet supports EIP-6963 standard
   - Try reconnecting the wallet

3. **API key issues**
   - Set up API keys in the extension settings
   - Verify API keys are valid

## Contributing

For development guidelines, please refer to the [root README](../../README.md#contributing).
