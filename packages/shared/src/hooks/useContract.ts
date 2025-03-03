import { useMemo } from "react";
import { useProvider, useSigner } from "./useProvider";
import { Contract } from "ethers";
import { useSupportedNetworkData } from "./useSupportedNetworkData";
import { useResilientJSONRPCProvider } from "./useResilientProvider";

export function useContract<T extends Contract = Contract>(
    address: string | undefined,
    ABI: any,
    networkId: number,
    walletProvider?: any,
    userAddress?: string,
    withSignerIfPossible = true
): T | null {
    const provider = useProvider(walletProvider);
    const signer = useSigner(provider, userAddress);
    const networkData = useSupportedNetworkData();
    const rpcUrls = useMemo(
        () => networkData.find((network) => network.chainId === networkId)?.rpcUrls,
        [networkData, networkId]
    );
    const resilientRpcProvider = useResilientJSONRPCProvider(rpcUrls, networkId);

    return useMemo(() => {
        if (!address || !ABI) return null;
        try {
            const contract = new Contract(
                address,
                ABI,
                withSignerIfPossible ? (signer ?? resilientRpcProvider) : resilientRpcProvider
            );
            return contract as T;
        } catch (error) {
            console.debug("Failed to get contract", error);
            return null;
        }
    }, [ABI, address, resilientRpcProvider, signer, withSignerIfPossible]);
}
