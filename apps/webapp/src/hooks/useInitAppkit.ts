import { AppKitNetwork } from "@reown/appkit/networks";
import * as chains from "viem/chains";
import useSupportedNetworkData from "./useSupportedNetworkData";
import { NetworkDataType } from "@/types/chain";
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
    name: "smartscan",
    description: "smart contract ABI extrapolator",
    url: "", // origin must match your domain & subdomain
    icons: [""],
};

const useInitAppkit = () => {
    const networkData = useSupportedNetworkData();
    const supportedNetworks = useMemo(() => {
        return networkData.map((network) => getOrDefineAppkitNetwork(network)).filter((x) => x !== undefined);
    }, [networkData]);

    useEffect(() => {
        createAppKit({
            adapters: [new EthersAdapter()],
            metadata,
            networks: supportedNetworks as [AppKitNetwork, ...AppKitNetwork[]],
            projectId: process.env.NEXT_PUBLIC_REOWN_CLOUD_APP_ID as string,
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
    }, [supportedNetworks]);
};

export default useInitAppkit;
