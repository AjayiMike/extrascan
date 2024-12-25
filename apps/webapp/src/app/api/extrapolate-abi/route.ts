import { getBytecode } from "@/utils/bytecode";
import { getContractCreationInfo } from "@/utils/contractCreationBlock";
import { fetchFunctionTextSignaturesFromPublicDatabases } from "@/utils/functionSignature";
import { whatsabi } from "@shazow/whatsabi";
import { getCachedData, setCachedData } from "@/utils/redisCache";
import { isAddress } from "@/utils/address";
import { getAddress } from "ethers";
import { getSupportedNetworks } from "@/config/network";
import { validateExtrapolatedABI } from "@/utils/validate";
import ModelProviderService from "@/utils/modelProviders";
import { ModelProvider, ModelApiKeys, MODEL_KEY_PREFIXES } from "@/types/models";

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
        const { networkId, address, apiKeys, preferredProvider } = await request.json();

        // Validate basic request parameters
        if (!isAddress(address)) {
            return Response.json({ error: "Invalid address format" }, { status: 400 });
        }
        if (typeof networkId !== "number") {
            return Response.json({ error: "Invalid networkId, networkId must be a number" }, { status: 400 });
        }

        // Validate network support
        const supportedNetworks = await getSupportedNetworks();
        if (supportedNetworks.findIndex((network) => network.chainId === Number(networkId)) === -1) {
            return Response.json({ error: "Unsupported network" }, { status: 400 });
        }

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

        const cacheKey = `extrapolated:${getAddress(address)}-${networkId}`;
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return Response.json(cachedData, { status: 200 });
        }

        const bytecode = await getBytecode(networkId, address);
        const selectors = whatsabi.selectorsFromBytecode(bytecode);
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
                { error: "Exracted function signatures not found in public database" },
                { status: 400 }
            );
        }
        console.log("apiKeys: ", apiKeys);

        const modelProvider = new ModelProviderService(apiKeys);
        console.log("preferredProvider_route: ", preferredProvider);

        const { ABI: ABI, confidence: ABIConfidenceScores } = await modelProvider.extrapolateABI(
            functionTextSignature,
            preferredProvider as ModelProvider | undefined
        );

        console.log("ABI, confidence: ABIConfidenceScores: ", { ABI: ABI[0], confidence: ABIConfidenceScores });

        const { blockNumber, deployer } = await getContractCreationInfo(networkId, address);

        const valid = validateExtrapolatedABI(ABI, ABIConfidenceScores);
        if (!valid) {
            throw new Error("Invalid ABI format returned from model");
        }

        const responseData = {
            ABI: JSON.stringify(ABI),
            ABIConfidenceScores,
            startBlock: blockNumber,
            deployer,
            address,
        };

        await setCachedData(cacheKey, responseData, 3600);

        return Response.json(responseData, { status: 200 });
    } catch (error: any) {
        console.error("ABI extrapolation failed:", error);
        return Response.json(
            { error: error?.message || "Something went wrong, please try again later" },
            { status: 500 }
        );
    }
}
