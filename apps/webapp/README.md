# Extrascan Web Application

This is the web application component of Extrascan, providing a standalone interface for interacting with Ethereum smart contracts through your browser.

## Overview

The web application provides a full-featured interface for:

-   Smart contract analysis and interaction
-   ABI extrapolation for unverified contracts
-   Multi-network support
-   Wallet connection with EIP-6963 support

## Tech Stack

-   [Next.js](https://nextjs.org/) - React framework
-   [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
-   [Ethers.js](https://docs.ethers.org/v6/) - Ethereum library
-   [React Hook Form](https://react-hook-form.com/) - Form management
-   [@reown/appkit](https://reown.com/appkit) - Wallet connection

## Development Setup

### Prerequisites

-   Node.js >= 20.12.0
-   pnpm >= 9.14.0
-   Redis server (for caching)

### Environment Configuration

Create a `.env.local` file in the webapp directory with these variables:

```
# Block explorer API keys
ETHERSCAN_API_KEY=your_key_here

# Redis configuration (for API response caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Optional AI model keys (can also be set via UI)
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### Local Development

1. From the root directory, install dependencies:

    ```bash
    pnpm install
    ```

2. Start the development server:

    ```bash
    # From root directory
    pnpm dev:webapp

    # Or from webapp directory
    pnpm dev
    ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

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
├── app/                # Next.js app router
│   ├── api/            # API routes for ABI extrapolation and contract data
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Home page component
├── assets/             # Images and static assets
├── components/         # Reusable UI components
│   ├── ContractDetails/# Contract interaction components
│   ├── footer/         # Footer components
│   ├── header/         # Header and navigation components
│   └── UniversalDApp/  # Core contract interaction UI
├── hooks/              # Custom React hooks
│   └── useInitAppkit.ts# Wallet connection hook
└── middleware/         # Next.js middleware
```

### Key Components

-   **UniversalDApp**: Core component for contract interaction, handling both verified and unverified contracts
-   **ContractDetails**: Displays contract information and function interfaces
-   **API Routes**: Backend logic for ABI extrapolation and contract data fetching

## Building and Deployment

### Building for Production

```bash
# From root directory
pnpm build:webapp

# Or from webapp directory
pnpm build
```

The build output will be in the `.next` directory.

### Deployment

The web application can be deployed to various platforms:

1. **Vercel** (Recommended)

    - Connect your GitHub repository to Vercel
    - Configure environment variables
    - Deploy

2. **Self-hosted**
    ```bash
    pnpm build:webapp
    pnpm start:webapp
    ```

## Testing

```bash
# Run tests
pnpm test
```

## Troubleshooting

### Common Issues

1. **Redis Connection Issues**

    - Ensure Redis server is running
    - Check environment variables are set correctly

2. **API Key Issues**

    - Verify API keys are valid
    - Check rate limits haven't been exceeded

3. **Contract Interaction Failures**
    - Ensure wallet is connected to the correct network
    - Verify contract address is valid for the selected network

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

-   [WhatsABI](https://github.com/shazow/whatsabi) for bytecode analysis
-   [openchain](https://openchain.xyz) for function signature lookup
-   [Ethers.js](https://docs.ethers.org/v6/) for Ethereum interaction
-   [chainid.network](https://chainid.network) for rich network data and RPC URL
-   [@reown/appkit](https://reown.com/appkit) for wallet connection
