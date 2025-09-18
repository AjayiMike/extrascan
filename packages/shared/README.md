# @extrascan/shared

This package contains shared components, utilities, hooks, and types used across the Extrascan ecosystem (both web application and browser extension).

## Overview

The shared package provides a unified codebase for core functionality, ensuring consistent behavior across different Extrascan platforms. It includes:

-   React components for contract interaction
-   Utilities for blockchain interactions
-   Hooks for state management
-   Type definitions
-   AI integration services
-   Configuration constants

## Package Structure

```
src/
├── components/          # Shared React components
├── configs/             # Configuration files and constants
│   ├── index.ts         # Configuration exports
│   └── network.ts       # Network configuration
├── constants/           # Constant values and definitions
│   ├── fragment.ts      # EVM ABI fragment definitions
│   └── index.ts         # Constants exports
├── hooks/               # Shared React hooks
├── index.ts             # Main package entry point
├── styles/              # Shared styles
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Usage

The shared package is designed to be imported by other packages in the monorepo. It exports various modules that can be imported directly:

```typescript
// Import components
import { Button, Card } from "@extrascan/shared/components";

// Import utilities
import { formatAddress, parseAbi } from "@extrascan/shared/utils";

// Import hooks
import { useWallet } from "@extrascan/shared/hooks";

// Import types
import { CodeDataType, ModelProvider } from "@extrascan/shared/types";
```

## Development

### Prerequisites

-   Node.js >= 20.12.0
-   pnpm >= 9.14.0

### Local Development

1. From the root directory, install dependencies:

    ```bash
    pnpm install
    ```

2. Start the development server with watch mode:

    ```bash
    # From root directory
    pnpm dev:shared

    # Or from shared directory
    pnpm dev
    ```

### Building

```bash
# From root directory
pnpm build:shared

# Or from shared directory
pnpm build
```

The build output will be in the `dist` directory.

## Key Components

### AI Integration

The shared package includes utilities for interacting with AI models for ABI extrapolation:

-   Google Gemini Pro integration
-   OpenAI GPT-4 integration (planned)
-   Anthropic Claude integration (planned)

```typescript
// Example usage of AI integration
import { extrapolateABI } from "@extrascan/shared/utils";

const result = await extrapolateABI(bytecode, apiKeys, ModelProvider.GEMINI);
```

### Contract Interaction

Components and utilities for interacting with smart contracts:

-   ABI parsing and validation
-   Function argument handling
-   Transaction sending and receipt handling
-   Error decoding

### Network Configuration

Configuration for supported blockchain networks:

-   Ethereum mainnet and testnets
-   Compatible EVM chains
-   RPC providers and block explorers

## Testing

```bash
# Run tests
pnpm test
```

## Adding New Features

When adding new features to the shared package:

1. Ensure they're genuinely needed by multiple applications
2. Maintain backward compatibility when possible
3. Update exports in the appropriate index.ts files
4. Add proper TypeScript types
5. Update documentation as needed

## Dependencies

This package has several peer dependencies that consuming applications must provide:

-   React
-   React DOM
-   Ethers.js
-   Other UI and utility libraries

See the `peerDependencies` section in `package.json` for the complete list.
