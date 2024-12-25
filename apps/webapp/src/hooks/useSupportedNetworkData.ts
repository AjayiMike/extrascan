import { loadSupportedNetworksData } from "@/config/network";
import { getSupportedNetworks } from "@/config/network";
import { NetworkDataType } from "@/types/chain";
import React, { useEffect, useMemo } from "react";

const useSupportedNetworkData = () => {
    const [networkData, setNetworkData] = React.useState<NetworkDataType[]>([]);
    useEffect(() => {
        async function loadNetworkData() {
            await loadSupportedNetworksData();
            const supportedNetworks = await getSupportedNetworks();
            setNetworkData(Object.values(supportedNetworks));
        }
        loadNetworkData();
    }, []);

    return networkData;
};

export default useSupportedNetworkData;

export const useNetworkDataForChainId = (networkId: number | undefined): NetworkDataType | null | undefined => {
    const networkData = useSupportedNetworkData();
    return useMemo(() => {
        if (!networkId) return null;
        return networkData.find((network) => network.chainId === networkId);
    }, [networkData, networkId]);
};
