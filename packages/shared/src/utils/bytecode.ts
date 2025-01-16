import { getRPCURLs } from "@/configs/network";

async function tryFetchBytecode(rpcUrl: string, address: string): Promise<string> {
    const result = await fetch(String(rpcUrl), {
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

    if (!result?.ok) {
        throw new Error(`HTTP error! status: ${result?.status}`);
    }

    const data = await result.json();

    if (data.error) {
        throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    if (!data?.result || data?.result === "0x") {
        throw new Error("Code not found: probably due to wrong networkId or the address is an EOA");
    }

    return data.result;
}

export const getBytecode = async (networkId: number, address: string): Promise<string> => {
    const rpcUrls = await getRPCURLs(networkId);
    if (!rpcUrls.length) {
        throw new Error(`Unable to get RPC URLs for network id ${networkId}`);
    }

    // Create promises for all RPC URLs
    const promises = rpcUrls.map((rpcUrl) =>
        tryFetchBytecode(rpcUrl, address).catch((error) => {
            console.debug(`Failed to fetch bytecode from ${rpcUrl}:`, error);
            return Promise.reject(error);
        })
    );

    // Try all URLs concurrently
    const results = await Promise.allSettled(promises);

    // Find the first successful result
    const firstSuccess = results.find((result) => result?.status === "fulfilled");

    console.log("firstSuccess", firstSuccess);
    if (firstSuccess && firstSuccess.status === "fulfilled") {
        return firstSuccess.value;
    }

    // If all failed, collect error messages
    const errors = results
        .filter((result): result is PromiseRejectedResult => result?.status === "rejected")
        .map((result) => result?.reason?.message || "Unknown error")
        .join("; ");

    throw new Error(`Failed to fetch contract bytecode from all RPC URLs. Errors: ${errors}`);
};
