import { useSDK } from "@metamask/sdk-react";
import { useMemo } from "react";
import useProvider, { useSigner } from "./useProvider";
import { Contract } from "ethers";

export function useContract<T extends Contract = Contract>(
    address: string | undefined,
    ABI: any,
    withSignerIfPossible = true
): T | null {
    const { provider: SDKProvider, account } = useSDK();
    const provider = useProvider(SDKProvider);
    const signer = useSigner(provider, account);
    return useMemo(() => {
        if (!address || !ABI || !provider) return null;
        try {
            const contract = new Contract(address, ABI, withSignerIfPossible ? (signer ?? provider) : provider);
            return contract as T;
        } catch (error) {
            console.error("Failed to get contract", error);
            return null;
        }
    }, [ABI, address, provider, signer, withSignerIfPossible]);
}
