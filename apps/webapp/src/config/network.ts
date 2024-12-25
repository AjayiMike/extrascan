const knownBadRPCs = ["api.mycryptoapi.com", "rpc.blocknative.com", "rpc.flashbots.net", "rpc.sepolia.ethpandaops.io"];
import {
    ChainidNetworkAPIResponseType,
    EtherscanChainListType,
    NetworkDataMapType,
    NetworkDataType,
} from "@/types/chain";

// Configuration constants
const CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // milliseconds
    API_ENDPOINTS: {
        ETHERSCAN: process.env.NEXT_PUBLIC_ETHERSCAN_API_URL,
        CHAINID: process.env.NEXT_PUBLIC_CHAINID_NETWORK_ENDPOINT,
    },
} as const;

class NetworkDataManager {
    private static instance: NetworkDataManager;
    private supportedNetworksLoaded = false;
    private supportedNetworkData: NetworkDataMapType = {};
    private loadingPromise: Promise<void> | null = null;

    private constructor() {
        // Bind all methods to this instance
        this.loadSupportedNetworksData = this.loadSupportedNetworksData.bind(this);
        this.isSupportedNetwork = this.isSupportedNetwork.bind(this);
        this.getSupportedNetworks = this.getSupportedNetworks.bind(this);
        this.getNetwork = this.getNetwork.bind(this);
        this.getNetworkName = this.getNetworkName.bind(this);
        this.getNetworkIcon = this.getNetworkIcon.bind(this);
        this.getRPCURLs = this.getRPCURLs.bind(this);
        this.getExplorerURLs = this.getExplorerURLs.bind(this);
    }

    public static getInstance(): NetworkDataManager {
        if (!NetworkDataManager.instance) {
            NetworkDataManager.instance = new NetworkDataManager();
        }
        return NetworkDataManager.instance;
    }

    /**
     * Generic retry mechanism for async operations
     */
    private async retry<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        let attempts = 0;
        while (attempts < CONFIG.MAX_RETRIES) {
            try {
                return await operation();
            } catch (error) {
                attempts++;
                console.debug(
                    `${errorMessage} - Attempt ${attempts}: ${error instanceof Error ? error.message : "Unknown error"}`
                );
                if (attempts === CONFIG.MAX_RETRIES) throw error;
                await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY));
            }
        }
        throw new Error("Retry failed");
    }

    /**
     * Fetches the list of chains from Etherscan
     */
    private async fetchChainList(): Promise<EtherscanChainListType> {
        const response = await this.retry(async () => {
            const res = await fetch(`${CONFIG.API_ENDPOINTS.ETHERSCAN}/chainlist`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        }, "Failed to fetch chain list");
        return response.result;
    }

    /**
     * Fetches network data for a single chain ID
     */
    private async fetchSingleNetworkData(chainId: number): Promise<ChainidNetworkAPIResponseType> {
        const response = await this.retry(async () => {
            const res = await fetch(`${CONFIG.API_ENDPOINTS.CHAINID}/page-data/chain/${chainId}/page-data.json`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        }, `Failed to fetch network data for chain ${chainId}`);
        return response.result.data.chain;
    }

    /**
     * Fetches network data for multiple chain IDs
     */
    private async fetchNetworkData(chainIds: number[]): Promise<ChainidNetworkAPIResponseType[]> {
        const results = await Promise.allSettled(chainIds.map((chainId) => this.fetchSingleNetworkData(chainId)));

        return results
            .filter(
                (result): result is PromiseFulfilledResult<ChainidNetworkAPIResponseType> =>
                    result.status === "fulfilled"
            )
            .map((result) => result.value);
    }

    /**
     * Loads data for supported networks
     */
    public async loadSupportedNetworksData(): Promise<void> {
        if (this.supportedNetworksLoaded) return;
        if (this.loadingPromise) return this.loadingPromise;

        this.loadingPromise = (async () => {
            try {
                const chainlist = await this.fetchChainList();
                const chainIds = chainlist.map((network) => Number(network.chainid)) ?? [];
                const networkData = await this.fetchNetworkData(chainIds);

                const supportedNetworks: NetworkDataType[] = networkData.map((network) => ({
                    chainId: network.chainId,
                    name: network.name,
                    rpcUrls:
                        network.rpc?.filter(
                            (rpc) => !rpc.includes("${") && !knownBadRPCs.some((badRpc) => rpc.includes(badRpc))
                        ) ?? [],
                    nativeCurrency: network.nativeCurrency,
                    iconUrl: network.icon ? `${CONFIG.API_ENDPOINTS.CHAINID}/${network.icon.publicURL}` : null,
                    explorers: network.explorers,
                }));

                this.supportedNetworkData = Object.fromEntries(
                    supportedNetworks.map((network) => [network.chainId, network])
                );

                this.supportedNetworksLoaded = true;
            } catch (error) {
                console.error("Failed to load network data:", error);
                throw error;
            } finally {
                this.loadingPromise = null;
            }
        })();

        return this.loadingPromise;
    }

    /**
     * Ensures network data is loaded before accessing it
     */
    private async ensureDataLoaded(): Promise<void> {
        if (!this.supportedNetworksLoaded) {
            await this.loadSupportedNetworksData();
        }
    }

    public async getSupportedNetworks(): Promise<NetworkDataType[]> {
        await this.ensureDataLoaded();
        return Object.values(this.supportedNetworkData);
    }

    /**
     * Checks if a network is supported
     */
    public async isSupportedNetwork(networkId: number): Promise<boolean> {
        await this.ensureDataLoaded();
        return Object.keys(this.supportedNetworkData).includes(networkId.toString());
    }

    /**
     * Gets network data or throws if network is not supported
     */
    private async getNetworkDataOrThrow(networkId: number): Promise<NetworkDataType> {
        if (!(await this.isSupportedNetwork(networkId))) {
            throw new Error(`Unknown network: ${networkId}`);
        }
        return this.supportedNetworkData[networkId];
    }

    /**
     * Gets the name of a supported network
     */
    public async getNetwork(networkId: number): Promise<NetworkDataType> {
        const network = await this.getNetworkDataOrThrow(networkId);
        return network;
    }

    /**
     * Gets the name of a supported network
     */
    public async getNetworkName(networkId: number): Promise<string> {
        const network = await this.getNetworkDataOrThrow(networkId);
        return network.name;
    }

    /**
     * Gets the icon URL of a supported network
     */
    public async getNetworkIcon(networkId: number): Promise<string | null> {
        const network = await this.getNetworkDataOrThrow(networkId);
        return network.iconUrl;
    }

    /**
     * Gets the RPC URLs of a supported network
     */
    public async getRPCURLs(networkId: number): Promise<string[]> {
        const network = await this.getNetworkDataOrThrow(networkId);
        return network.rpcUrls;
    }

    /**
     * Gets the explorer URLs of a supported network
     */
    public async getExplorerURLs(networkId: number): Promise<NetworkDataType["explorers"]> {
        const network = await this.getNetworkDataOrThrow(networkId);
        return network.explorers;
    }
}

// Create and export the singleton instance
const networkManager = NetworkDataManager.getInstance();

// Export bound methods to maintain 'this' context
export const loadSupportedNetworksData = networkManager.loadSupportedNetworksData;
export const isSupportedNetwork = networkManager.isSupportedNetwork;
export const getSupportedNetworks = networkManager.getSupportedNetworks;
export const getNetwork = networkManager.getNetwork;
export const getNetworkName = networkManager.getNetworkName;
export const getNetworkIcon = networkManager.getNetworkIcon;
export const getRPCURLs = networkManager.getRPCURLs;
export const getExplorerURLs = networkManager.getExplorerURLs;

// Initialize the loading of supported networks data
loadSupportedNetworksData();
