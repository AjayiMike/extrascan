# Extrascan

Extrascan enables interaction with Ethereum smart contracts, whether they are verified or not. It uses AI models to extrapolate ABIs from unverified contract bytecode, making it possible to interact with contracts that aren't verified on block explorers.

## Features

-   Smart contract ABI extraction and interaction
-   Support for unverified contracts through AI-powered ABI extrapolation
-   Multi-network support for Ethereum and compatible chains
-   Interactive contract function calling (read/write)
-   Confidence scores for extrapolated functions
-   Secure API key management
-   Web3 wallet integration

## Prerequisites

-   Node.js >= 20.12.2
-   Yarn >= 1.22.19
-   Redis server (for caching)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/AjayiMike/extrascan.git
    cd extrascan
    ```

2. Install dependencies:

    ```bash
    yarn install
    ```

3. Environment Setup

    Create a `.env` file and paste the content of `.env.example`, then set the values for the following:

    - ETHERSCAN_API_KEY
    - REDIS_HOST
    - REDIS_PASSWORD
    - REDIS_PORT

4. Start the development server:

    ```bash
    yarn dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## AI Model Integration

Currently supported:

-   Google Gemini Pro

Coming soon:

-   OpenAI GPT-4
-   Anthropic Claude

To use the AI features, you'll need to obtain an API key from Google's AI Studio and add it through the application's API key settings in the app.

## Project Structure

```
src/
├── app/ # Next.js app router
├── assets/ images
├── components/ # Reusable UI components
├── config/ # Configuration files
├── constant/ # Constant files
├── hooks/ # Custom React hooks
├── types/ # TypeScript type definitions
├── utils/ # Utility functions
└── views/ # Page-specific components
```

## Contributing

1. Fork the repository
2. clone your forked version
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
