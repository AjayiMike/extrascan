import type { CodeDataType } from "@/types/core";
import type { Result } from "@/types/result";

export const loadCodeFromEtherscan = async (
    etherscanApiKey: string,
    networkId: number,
    address: string,
    proxyAddress?: string,
    retries = 2
): Promise<Result<CodeDataType>> => {
    try {
        const response = await fetch(
            `https://api.etherscan.io/v2/api?chainid=${networkId}&module=contract&action=getsourcecode&address=${address}&apikey=${etherscanApiKey}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Etherscan returns a JSON object that has a `status`, a `message` and
        // a `result` field. The `status` is '0' in case of errors and '1' in
        // case of success
        if (data.status === "0") {
            if (retries > 0) {
                // Retry the request
                return loadCodeFromEtherscan(etherscanApiKey, networkId, address, proxyAddress, retries - 1);
            } else {
                return {
                    error: {
                        message: `${data.message} ${data.result}`,
                    },
                };
            }
        }

        console.log({ address, proxyAddress });

        const contractCodeData = data.result[0];
        // if it is the implementation || it claims to be a proxy, but the implementation address is same as the proxy address
        if (contractCodeData.Proxy === "0" || contractCodeData.Implementation === address) {
            const isVerified = contractCodeData.ABI !== "Contract source code not verified";
            return {
                data: {
                    address: proxyAddress || address,
                    networkId,
                    isVerified,
                    contractName: contractCodeData.ContractName || null,
                    sourceCode: contractCodeData.SourceCode || null,
                    ABI: isVerified ? contractCodeData.ABI : null,
                    compilerVersion: contractCodeData.CompilerVersion || null,
                    optimizationUsed: contractCodeData.OptimizationUsed || null,
                    runs: contractCodeData.Runs || null,
                    isProxy: !!proxyAddress,
                    implementationAddress: !!proxyAddress ? address : undefined,
                },
            };
        }
        // it is the proxy, go to implementation
        const _proxyAddress = address;
        return loadCodeFromEtherscan(etherscanApiKey, networkId, contractCodeData.Implementation, _proxyAddress);
    } catch (error) {
        console.log(error);
        if (retries > 0) {
            // Retry the request
            return loadCodeFromEtherscan(etherscanApiKey, networkId, address, proxyAddress, retries - 1);
        } else {
            return {
                error: {
                    message: "error getting smart contract data information",
                },
            };
        }
    }
};
