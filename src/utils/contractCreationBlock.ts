import { getEtherscanLikeAPIUrl, getPublicRPCEndpoint, getNetworkName } from "@/config/network";

export const getContractCreationInfo = async (
    networkId: number | string,
    address: string
): Promise<{ blockNumber: number; deployer: string }> => {
    try {
        const transactionHash = await fetchDeployContractTransactionFromEtherscan(networkId, address);
        const txn = await fetchTransactionByHashFromRPC(networkId, transactionHash);
        const blockNumber = parseInt(txn.result.blockNumber, 16);
        const deployer = txn.result.from;
        return { blockNumber, deployer };
    } catch (error: any) {
        throw new Error(error?.message);
    }
};

export const fetchDeployContractTransactionFromEtherscan = async (
    networkId: number | string,
    address: string
): Promise<string> => {
    const scanApiUrl = getEtherscanLikeAPIUrl(getNetworkName(networkId));
    const json = await fetchContractCreationHashWithRetry(
        `${scanApiUrl}?module=contract&action=getcontractcreation&contractaddresses=${address}`,
        5
    );
    if (json.status === "1") {
        const hash = json.result[0].txHash;
        return hash;
    }

    throw new Error(`Failed to fetch deploy contract transaction`);
};

export const fetchContractCreationHashWithRetry = async (url: string, retryCount: number): Promise<any> => {
    let json;
    for (let i = 0; i < retryCount; i++) {
        try {
            const result = await fetch(url);
            json = await result.json();
            if (json.status !== "0") {
                return json;
            }
        } catch (error) {
            console.error("Failed to fetch contract creation transaction hash: ", error);
        }
    }
    throw new Error(`Failed to fetch contract creation transaction hash`);
};

export const fetchTransactionByHashFromRPC = async (
    networkId: number | string,
    transactionHash: string
): Promise<any> => {
    let json: any;
    try {
        const RPCURL = getPublicRPCEndpoint(getNetworkName(networkId));
        if (!RPCURL) throw new Error(`Unable to fetch RPC URL for ${getNetworkName(networkId)}`);
        const result = await fetch(String(RPCURL), {
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
        json = await result.json();
        return json;
    } catch (error) {
        console.error("Failed to fetchTransactionByHashFromRPC: ", error);
        throw new Error("Failed to fetch contract creation transaction");
    }
};
