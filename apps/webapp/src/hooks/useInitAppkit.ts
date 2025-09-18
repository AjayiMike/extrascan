import type { AppKitNetwork } from "@reown/appkit/networks";
import * as chains from "viem/chains";
import { useSupportedNetworkData } from "@extrascan/shared/hooks";
import type { NetworkDataType } from "@extrascan/shared/types";
import { extractChain, defineChain } from "viem/utils";
import { useEffect, useMemo } from "react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { createAppKit } from "@reown/appkit";

const allChains = Object.values(chains);

const getOrDefineAppkitNetwork = (networkData: NetworkDataType): AppKitNetwork | undefined => {
    try {
        const extracted = extractChain({ chains: allChains, id: networkData.chainId as any });
        if (extracted) return extracted;

        return defineChain({
            id: networkData.chainId,
            name: networkData.name,
            network: networkData.name,
            nativeCurrency: networkData.nativeCurrency,
            rpcUrls: {
                default: {
                    http: networkData.rpcUrls,
                },
            },
            blockExplorers: {
                default: {
                    name: networkData.explorers[0].name,
                    url: networkData.explorers[0].url,
                },
            },
        });
    } catch (error) {
        console.debug("Failed to getOrDefineAppkitNetwork: ", error);
    }
};

const metadata = {
    name: "extrascan",
    description: "smart contract ABI extrapolator",
    url: "", // origin must match your domain & subdomain
    icons: [""],
};

export const useInitAppkit = (reownCloudAppId: string) => {
    const networkData = useSupportedNetworkData();
    const supportedNetworks = useMemo(() => {
        return networkData.map((network: any) => getOrDefineAppkitNetwork(network)).filter((x) => x !== undefined);
    }, [networkData]);

    useEffect(() => {
        createAppKit({
            adapters: [new EthersAdapter()],
            metadata,
            networks: supportedNetworks as [AppKitNetwork, ...AppKitNetwork[]],
            projectId: reownCloudAppId,
            allowUnsupportedChain: false,
            defaultNetwork: supportedNetworks[0],
            enableEIP6963: true,
            enableInjected: false,
            features: {
                analytics: true,
                email: false,
                onramp: false,
                socials: false,
                swaps: false,
            },
            themeMode: "light",
            themeVariables: {
                "--w3m-accent": "#155e75",
                "--w3m-border-radius-master": "0",
            },
        });
    }, [reownCloudAppId, supportedNetworks]);
};
