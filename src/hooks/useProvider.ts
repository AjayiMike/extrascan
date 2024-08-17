import { SDKState } from "@metamask/sdk-react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useEffect, useMemo, useState } from "react";

const useProvider = (provider: SDKState["provider"]): BrowserProvider | null => {
    if (!provider) return null;
    return new BrowserProvider(provider);
};

export const useSigner = (
    provider: BrowserProvider | null,
    account: SDKState["account"] | null
): JsonRpcSigner | null => {
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchSigner = async () => {
            if (!provider || !account) {
                setSigner(null);
                return;
            }
            try {
                const newSigner = await provider.getSigner(account);
                if (mounted) {
                    setSigner((prev) => (isSignerEqual(prev, newSigner) ? prev : newSigner));
                }
            } catch (error) {
                console.error("Error getting signer:", error);
                if (mounted) {
                    setSigner(null);
                }
            }
        };

        fetchSigner();

        return () => {
            mounted = false;
        };
    }, [provider, account]);

    return useMemo(() => signer, [signer]);
};

const isSignerEqual = (prevSigner: JsonRpcSigner | null, newSigner: JsonRpcSigner | null) => {
    if (prevSigner === newSigner) return true;
    if (!prevSigner || !newSigner) return false;
    return prevSigner.address === newSigner.address;
};

export default useProvider;
