# Extrascan

Extrascan is a powerful tool for interacting with Ethereum smart contracts, whether they are verified or not. It uses AI models to extrapolate ABIs from unverified contract bytecode, making it possible to interact with contracts that aren't verified on block explorers.

## Project Overview

Extrascan consists of two main applications:

1. **Web Application** - A standalone web interface for contract interaction
2. **Browser Extension** - Enhances blockchain explorers (like Etherscan and Blockscout) with Extrascan's capabilities

Both applications share core functionality through a common shared package, providing a consistent experience across platforms.

## Features

-   **Smart Contract ABI Extraction and Interaction**

    -   Direct interaction with verified contracts
    -   AI-powered ABI extrapolation for unverified contracts
    -   Interactive contract function calling (read/write)

-   **Multi-Platform Support**

    -   Web application for standalone use
    -   Browser extension that integrates directly with block explorers

-   **Multi-Network Compatibility**

    -   Support for Ethereum and compatible chains
    -   Easy network switching

-   **AI Integration**

    -   Currently supported: Google Gemini Pro
    -   Coming soon: OpenAI GPT-4, Anthropic Claude
    -   Confidence scores for extrapolated functions

-   **Web3 Features**
    -   Secure API key management
    -   Web3 wallet integration
    -   EIP-6963 compliant wallet connection

## Prerequisites

-   Node.js >= 20.12.0
-   pnpm >= 9.14.0
-   Redis server (for caching)

## Project Structure

```
/
├── apps/                  # Applications
│   ├── extension/         # Browser extension
│   └── webapp/            # Web application
├── packages/              # Shared packages
│   └── shared/            # Common utilities and components
```

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/AjayiMike/extrascan.git
    cd extrascan
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Environment Setup:
   Create appropriate `.env` files in the webapp directory with necessary API keys:
    - ETHERSCAN_API_KEY
    - REDIS_HOST
    - REDIS_PASSWORD
    - REDIS_PORT

## Development

### Shared Package

```bash
# Run in watch mode
pnpm dev:shared

# Build for production
pnpm build:shared
```

### Web Application

```bash
# Run development server
pnpm dev:webapp

# Build for production
pnpm build:webapp

# Start production server
pnpm start:webapp
```

### Browser Extension

```bash
# Run development build
pnpm dev:extension

# Build for production
pnpm build:extension
```

For extension development, load the appropriate build directory in your browser:

-   Chrome/Edge (Manifest v3): `apps/extension/build/chrome-mv3-dev`

## Usage

### Web Application

1. Navigate to the deployed web app or local development server
2. Connect your Web3 wallet
3. Select network and enter a contract address to analyze and interact with

### Browser Extension

1. Install the extension from the Chrome Web Store (or load unpacked during development)
2. Navigate to a contract address on Etherscan
3. Click the "Extrascan" tab to access enhanced functionality
4. Connect your wallet and interact with the contract

## Contributing

1. Fork the repository
2. Clone your forked version
3. Create your feature branch (`git checkout -b feature/amazing-feature`)
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

-   [WhatsABI](https://github.com/shazow/whatsabi) for bytecode analysis
-   [openchain](https://openchain.xyz) for function signature lookup
-   [Ethers.js](https://docs.ethers.org/v6/) for Ethereum interaction
-   [chainid.network](https://chainid.network) for rich network data and RPC URL
-   [@reown/appkit](https://reown.com/appkit) for wallet connection
-   [Plasmo](https://plasmo.com/) for browser extension development framework
