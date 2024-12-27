import { JsonRpcProvider } from "ethers";
import { useEffect } from "react";
import { useState } from "react";

/**
 * ResilientRpcProvider
 *
 * A modified version of StaticJsonRpcProvider that handles failover between multiple RPC endpoints
 */
class ResilientRpcProvider extends JsonRpcProvider {
    /**
     * Array of providers to be used for retries
     */
    providers: JsonRpcProvider[];

    /**
     * Index of the currently active provider in the providers array.
     */
    activeProviderIndex: number;

    /**
     * Error thrown by the last failed provider
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;

    /**
     * Flag indicating if logging is enabled.
     * If true, logs will be output to the console when failover occurs.
     */
    loggingEnabled: boolean;

    /**
     * @param rpcUrls Array of RPC urls to be used to initialize providers
     * @param chainId Chain Id of the network
     * @param loggingEnabled Flag indicating if logging is enabled.
     */
    constructor(rpcUrls: string[], chainId: number, loggingEnabled = false) {
        // Initialize the super class with the first RPC url.
        super(rpcUrls[0], chainId);

        // Create an array of providers off of the rpcUrls
        this.providers = rpcUrls.map((url) => new JsonRpcProvider(url, chainId));

        // Start off as -1 and will be incremented to 0 just before the first call is made
        this.activeProviderIndex = -1;

        this.loggingEnabled = loggingEnabled;
    }

    /**
     * Overrides the send method of the super class to provide retry functionality
     *
     * This send function is the highlight of this class.
     * It takes advantage of the parent class's send method, but provides retry
     * functionality in case of failures.
     *
     * If the retryCount is equal to the number of providers, it means that all providers have failed.
     * In that case, it will throw the last error it encountered.
     *
     * @param method RPC method to execute
     * @param params Parameters of the RPC method
     * @param retryCount Number of times the call had been retried (default: 0)
     * @returns The result of the RPC method
     */
    async send(method: string, params: Array<any>, retryCount = 0): Promise<any> {
        this.validateRetryAttempt(retryCount);

        try {
            const provider = this.getNextProvider();
            return await provider.send(method, params);
        } catch (error) {
            this.error = error;

            if (this.loggingEnabled) {
                console.debug(
                    `provider ${
                        this.providers[this.activeProviderIndex]._getConnection().url
                    } Failed. Trying the next provider in the list`
                );
            }

            return this.send(method, params, retryCount + 1);
        }
    }

    /**
     * Gets the next provider in the list of providers
     *
     * @returns The next provider
     */
    private getNextProvider(): JsonRpcProvider {
        this.activeProviderIndex = (this.activeProviderIndex + 1) % this.providers.length;
        return this.providers[this.activeProviderIndex];
    }

    /**
     * Validates the retry count and throws the last error saved if the retryCount equals or exceeds the number of providers.
     *
     * @param {number} retryCount - The number of times the request had been retried
     */
    private validateRetryAttempt(retryCount: number): void {
        if (retryCount >= this.providers.length) {
            const error = this.error;
            this.error = undefined;
            throw new Error(error);
        }
        return void 0;
    }
}

export const useResilientJSONRPCProvider = (rpcUrls?: string[], networkId?: number, loggingEnabled = false) => {
    const [provider, setProvider] = useState<ResilientRpcProvider | null>(null);

    useEffect(() => {
        if (!rpcUrls || !rpcUrls.length || !networkId) return setProvider(null);
        const resilientRpcProvider = new ResilientRpcProvider(rpcUrls, networkId, loggingEnabled);
        setProvider(resilientRpcProvider);
    }, [networkId, loggingEnabled, rpcUrls]);

    return provider;
};
