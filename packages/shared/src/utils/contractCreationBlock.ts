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
        const txn = await fetchTransactionByHashFromRPC(networkId, transactionHash, retries);
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
    let json;
    for (let i = 0; i < retryCount; i++) {
        try {
            const result = await fetch(url);
            json = await result.json();
            if (json.status !== "0") {
                return json;
            }
        } catch (error) {
            console.debug("Failed to fetch contract creation transaction hash: ", error);
        }
    }
    throw new Error(`Failed to fetch contract creation transaction hash`);
};

export const fetchTransactionByHashFromRPC = async (
    networkId: number,
    transactionHash: string,
    retries: number = 2
): Promise<any> => {
    let json: any;
    for (let i = 0; i <= retries; i++) {
        try {
            const RPCURL = (await getRPCURLs(networkId))[0];
            if (!RPCURL) throw new Error(`Unable to fetch RPC URL for network id ${networkId}`);

            const result = await fetch(RPCURL, {
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

            if (json.result) {
                return json;
            }
        } catch (error) {
            if (i === retries) {
                console.debug("Failed to fetchTransactionByHashFromRPC after max retries: ", error);
                throw new Error(`Failed to fetch contract creation transaction after ${retries} retries`);
            }
        }
    }
};
