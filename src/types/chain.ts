export type EtherscanChainType = {
    chainname: string;
    chainid: string;
    blockexplorer: string;
    apiurl: string;
    status: number;
    comment: string;
};

export type EtherscanChainListType = EtherscanChainType[];

export type ChainidNetworkAPIResponseType = {
    chainId: number;
    name: string;
    rpc: string[];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    icon: { publicURL: string | null; childImageSharp: any };
    explorers: { name: string; url: string; standard: string }[];
};

export type NetworkDataType = {
    chainId: ChainidNetworkAPIResponseType["chainId"];
    name: ChainidNetworkAPIResponseType["name"];
    rpcUrls: ChainidNetworkAPIResponseType["rpc"];
    nativeCurrency: ChainidNetworkAPIResponseType["nativeCurrency"];
    iconUrl: string | null;
    explorers: ChainidNetworkAPIResponseType["explorers"];
};

export type NetworkDataMapType = Record<number, NetworkDataType>;
