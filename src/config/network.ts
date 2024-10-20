export const supportedNetworks = [
    {
        id: 1,
        name: "mainnet",
        icon: "https://raw.githubusercontent.com/blockscout/frontend-configs/refs/heads/main/configs/network-icons/ethereum.svg",
    },
    {
        id: 1301,
        name: "unichain-testnet",
        icon: "https://raw.githubusercontent.com/blockscout/frontend-configs/refs/heads/main/configs/network-icons/unichain-icon.svg",
    },
];

export const isSupportedNetwork = (networkId: number | string) => {
    return supportedNetworks.some((network) => network.id === Number(networkId));
};

export const getNetworkName = (networkId: number | string) => {
    switch (Number(networkId)) {
        case 1:
            return "mainnet";
        case 1301:
            return "unichain-testnet";
        default:
            throw new Error(`Unknown network: ${networkId}`);
    }
};

export const getNetworkIcon = (networkId: number | string) => {
    switch (Number(networkId)) {
        case 1:
            return "https://raw.githubusercontent.com/blockscout/frontend-configs/refs/heads/main/configs/network-icons/ethereum.svg";
        case 1301:
            return "https://raw.githubusercontent.com/blockscout/frontend-configs/refs/heads/main/configs/network-icons/unichain-icon.svg";
        default:
            throw new Error(`Unknown network: ${networkId}`);
    }
};

export const getEtherscanLikeAPIUrl = (network: string) => {
    switch (network) {
        case "mainnet":
            return `https://mainnet.abi.pinax.network/api`;
        case "unichain-testnet":
            return "https://unichain-sepolia.blockscout.com/api";
        default:
            return `https://api-${network}.etherscan.io/api`;
    }
};
export const getPublicRPCEndpoint = (network: string) => {
    switch (network) {
        case "mainnet":
            return "https://rpc.ankr.com/eth";
        case "unichain-testnet":
            return "http://beta-u-Proxy-9QsHxlNJa4es-1179015898.us-east-2.elb.amazonaws.com:8545";
        default:
            throw new Error(`Unknown network: ${network}`);
    }
};
