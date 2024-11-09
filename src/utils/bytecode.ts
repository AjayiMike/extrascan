import { getNetworkName, getRPCURLs } from "@/config/network";

export const getBytecode = async (networkId: number, address: string): Promise<string> => {
    try {
        const RPCURL = (await getRPCURLs(networkId))[0];
        if (!RPCURL) throw new Error(`Unable to fetch RPC URL for network id ${networkId}`);
        const result = await fetch(String(RPCURL), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getCode",
                params: [address, "latest"],
                id: 1,
            }),
        });
        const data = await result.json();

        if (data.result === "0x")
            throw new Error("Code not found: probably due to wrong networkId or the address is an EOA");
        return data.result;
    } catch (error) {
        console.debug("Failed to fetch contract bytecode: ", error);
        throw new Error("Failed to fetch contract bytecode");
    }
};
