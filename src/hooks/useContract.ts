import { Contract } from "@ethersproject/contracts";
import { useSDK } from "@metamask/sdk-react";
import { useMemo } from "react";
import useProvider from "./useProvider";

export function useContract<T extends Contract = Contract>(
    address: string | undefined,
    ABI: any,
    withSignerIfPossible = true
): T | null {
    const { provider: SDKProvider, account } = useSDK();
    const provider = useProvider(SDKProvider);
    return useMemo(() => {
        if (!address || !ABI || !provider) return null;
        if (!address) return null;
        try {
            const contract = new Contract(address, ABI, withSignerIfPossible ? provider?.getSigner(account) : provider);
            return contract as T;
        } catch (error) {
            console.error("Failed to get contract", error);
            return null;
        }
    }, [ABI, account, address, provider, withSignerIfPossible]);
}
