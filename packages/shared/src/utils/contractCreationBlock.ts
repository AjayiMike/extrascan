import { getRPCURLs } from "@/configs/network";

export const getContractCreationInfo = async (
    etherscanApiKey: string,
    networkId: number,
    address: string,
    retries: number = 2
): Promise<{ blockNumber: number; deployer: string }> => {
    try {
        const transactionHash = await fetchDeployContractTransactionFromEtherscan(
            etherscanApiKey,
            networkId,
            address,
            retries
        );
        if (!transactionHash) throw new Error("Failed to fetch contract creation transaction");
        const txn = await fetchTransactionByHashFromRPC(networkId, transactionHash);
        console.log("txn", txn);
        const blockNumber = parseInt(txn.result.blockNumber, 16);
        const deployer = txn.result.from;
        return { blockNumber, deployer };
    } catch (error: any) {
        throw new Error(error?.message);
    }
};

export const fetchDeployContractTransactionFromEtherscan = async (
    etherscanApiKey: string,
    networkId: number,
    address: string,
    retries: number = 2
): Promise<string | undefined> => {
    let json;
    for (let i = 0; i <= retries; i++) {
        try {
            json = await fetchContractCreationHashWithRetry(
                `https://api.etherscan.io/v2/api?chainid=${networkId}&module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${etherscanApiKey}`,
                5
            );
            if (json.status === "1") {
                const hash = json.result[0].txHash;
                return hash;
            }
        } catch (error) {
            console.debug(error);
            if (i === retries) {
                throw new Error(`Failed to fetch deploy contract transaction after ${retries} retries`);
            }
        }
    }
    return undefined;
};

export const fetchContractCreationHashWithRetry = async (url: string, retryCount: number): Promise<any> => {
    for (let i = 0; i < retryCount; i++) {
        try {
            const result = await fetch(url);
            if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
            const json = await result.json();
            if (json.status !== "0") {
                return json;
            }
        } catch (error) {
            console.debug(`Attempt ${i + 1} failed to fetch contract creation transaction hash: ${error}`);
            if (i === retryCount - 1)
                throw new Error(`Failed to fetch contract creation transaction hash after ${retryCount} retries`);
        }
    }
};

async function tryFetchTransaction(rpcUrl: string, transactionHash: string): Promise<any> {
    const result = await fetch(rpcUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getTransactionByHash",
            params: [transactionHash],
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

    if (!data?.result) {
        throw new Error("Transaction not found");
    }

    return data;
}

export const fetchTransactionByHashFromRPC = async (networkId: number, transactionHash: string): Promise<any> => {
    const rpcUrls = await getRPCURLs(networkId);
    if (!rpcUrls.length) {
        throw new Error(`Unable to get RPC URLs for network id ${networkId}`);
    }

    // Create promises for all RPC URLs
    const promises = rpcUrls.map((rpcUrl) =>
        tryFetchTransaction(rpcUrl, transactionHash).catch((error) => {
            console.debug(`Failed to fetch transaction from ${rpcUrl}:`, error);
            return Promise.reject(error);
        })
    );

    // Try all URLs concurrently
    const results = await Promise.allSettled(promises);

    // Find the first successful result
    const firstSuccess = results.find((result) => result?.status === "fulfilled");
    if (firstSuccess && firstSuccess.status === "fulfilled") {
        return firstSuccess.value;
    }

    // If all failed, collect error messages
    const errors = results
        .filter((result): result is PromiseRejectedResult => result?.status === "rejected")
        .map((result) => result?.reason?.message || "Unknown error")
        .join("; ");

    throw new Error(`Failed to fetch transaction from all RPC URLs. Errors: ${errors}`);
};
