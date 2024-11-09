import { CodeDataType } from "@/types/core";
import { Result } from "@/types/result";

export const loadCodeFromEtherscan = async (
    networkId: number,
    address: string,
    retries = 2
): Promise<Result<CodeDataType>> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_ETHERSCAN_API_URL}/api?chainid=${networkId}&module=contract&action=getsourcecode&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
        );
        const data = await response.json();

        // Etherscan returns a JSON object that has a `status`, a `message` and
        // a `result` field. The `status` is '0' in case of errors and '1' in
        // case of success
        if (data.status === "0") {
            if (retries > 0) {
                // Retry the request
                return loadCodeFromEtherscan(networkId, address, retries - 1);
            } else {
                return {
                    error: {
                        message: `${data.message} ${data.result}`,
                    },
                };
            }
        }

        const contractCodeData = data.result[0];

        // if it is the implementation || it claims to be a proxy, but the implementation address is same as the proxy address
        if (contractCodeData.Proxy === "0" || contractCodeData.Implementation === address) {
            const isVerified = contractCodeData.ABI !== "Contract source code not verified";
            return {
                data: {
                    address,
                    networkId,
                    isVerified,
                    contractName: contractCodeData.ContractName || null,
                    sourceCode: contractCodeData.SourceCode || null,
                    ABI: isVerified ? contractCodeData.ABI : null,
                    compilerVersion: contractCodeData.CompilerVersion || null,
                    optimizationUsed: contractCodeData.OptimizationUsed || null,
                    runs: contractCodeData.Runs || null,
                },
            };
        }
        // it is the proxy, go to implementation
        return loadCodeFromEtherscan(networkId, contractCodeData.Implementation);
    } catch (error) {
        if (retries > 0) {
            // Retry the request
            return loadCodeFromEtherscan(networkId, address, retries - 1);
        } else {
            return {
                error: {
                    message: "error getting smart contract data information",
                },
            };
        }
    }
};
