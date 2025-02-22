import { getBytecode } from "@extrascan/shared/utils";
import { getContractCreationInfo } from "@extrascan/shared/utils";
import { fetchFunctionTextSignaturesFromPublicDatabases } from "@extrascan/shared/utils";
import { whatsabi } from "@shazow/whatsabi";
import { RedisCache } from "@extrascan/shared/utils";
import { isAddress } from "@extrascan/shared/utils";
import { getSupportedNetworks } from "@extrascan/shared/configs";
import { validateExtrapolatedABI } from "@extrascan/shared/utils";
import { ModelProviderService } from "@extrascan/shared/utils";
import { ModelProvider, ModelApiKeys, MODEL_KEY_PREFIXES } from "@extrascan/shared/types";
import { generateCacheKey, CacheKeyPrefix } from "@extrascan/shared/utils";

function validateApiKeys(apiKeys: ModelApiKeys): boolean {
    // At least one valid API key must be provided
    return Object.entries(apiKeys).some(([provider, key]) => {
        if (!key) return false;
        return key.startsWith(MODEL_KEY_PREFIXES[provider as ModelProvider]);
    });
}

function validatePreferredProvider(provider: string | undefined): provider is ModelProvider {
    if (!provider) return true; // undefined is valid
    return Object.values(ModelProvider).includes(provider as ModelProvider);
}

export async function POST(request: Request) {
    try {
        const { networkId, address, bytecode, apiKeys, preferredProvider } = await request.json();

        // Validate API keys
        if (!apiKeys || !validateApiKeys(apiKeys)) {
            return Response.json(
                {
                    error: "At least one valid API key must be provided",
                },
                { status: 400 }
            );
        }

        // Validate preferred provider if specified
        if (!validatePreferredProvider(preferredProvider)) {
            return Response.json(
                {
                    error: "Invalid preferred provider",
                },
                { status: 400 }
            );
        }

        if (!bytecode && (!networkId || !address)) {
            return Response.json(
                {
                    error: "Either bytecode or both networkId and address must be provided",
                },
                { status: 400 }
            );
        }

        if (networkId && address) {
            // Validate address format
            if (!isAddress(address)) {
                return Response.json({ error: "Invalid address format" }, { status: 400 });
            }

            // Validate networkId
            if (typeof networkId !== "number") {
                return Response.json({ error: "Invalid networkId, networkId must be a number" }, { status: 400 });
            }

            // Validate network support
            const supportedNetworks = await getSupportedNetworks();
            if (supportedNetworks.findIndex((network) => network.chainId === Number(networkId)) === -1) {
                return Response.json({ error: "Unsupported network" }, { status: 400 });
            }
        }

        const redisCache = new RedisCache(
            process.env.REDIS_HOST as string,
            Number(process.env.REDIS_PORT),
            process.env.REDIS_PASSWORD as string
        );

        const cacheKey = generateCacheKey(CacheKeyPrefix.EXTRAPOLATED, {
            bytecode,
            address,
            networkId,
        });

        const cachedData = await redisCache.getCachedData(cacheKey);
        if (cachedData) {
            return Response.json(cachedData, { status: 200 });
        }

        // Get bytecode either from input or by fetching
        const contractBytecode = bytecode || (await getBytecode(networkId, address));
        const selectors = whatsabi.selectorsFromBytecode(contractBytecode);

        if (!selectors.length) {
            return Response.json(
                {
                    error: "No function selectors found in bytecode",
                },
                { status: 400 }
            );
        }

        const functionTextSignatureData = await fetchFunctionTextSignaturesFromPublicDatabases(selectors);
        const functionTextSignature = functionTextSignatureData
            .filter((x) => x.text_signature !== null)
            .map((x) => x.text_signature);

        if (!functionTextSignature.length) {
            return Response.json(
                { error: "Extracted function signatures not found in public database" },
                { status: 400 }
            );
        }

        const modelProvider = new ModelProviderService(apiKeys);

        const { ABI, confidence: ABIConfidenceScores } = await modelProvider.extrapolateABI(
            functionTextSignature,
            preferredProvider as ModelProvider | undefined
        );

        const valid = validateExtrapolatedABI(ABI, ABIConfidenceScores);
        if (!valid) {
            throw new Error("Invalid ABI format returned from model");
        }

        let responseData: any = {
            ABI: JSON.stringify(ABI),
            ABIConfidenceScores,
        };

        // Add contract creation info only if address and networkId are provided
        if (networkId && address) {
            const { blockNumber, deployer } = await getContractCreationInfo(
                process.env.ETHERSCAN_API_KEY as string,
                networkId,
                address
            );
            responseData = {
                ...responseData,
                startBlock: blockNumber,
                deployer,
                address,
            };
        }

        await redisCache.setCachedData(cacheKey, responseData, 3600);

        return Response.json(responseData, { status: 200 });
    } catch (error: any) {
        console.error("ABI extrapolation failed:", error);
        return Response.json(
            { error: error?.message || "Something went wrong, please try again later" },
            { status: 500 }
        );
    }
}

// on vercel, serverless funntions are set to run for 10 seconds by default, but can be increased to up to 30 seconds
// we need to set the maxDuration to 20 seconds to allow for the abi extrapolation to complete
// otherwise, the function will be terminated by vercel and we will get a 502/504 error on the frontend
export const maxDuration = 20;
