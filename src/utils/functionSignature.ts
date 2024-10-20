import { Signature } from "@/types/signature";
import qs from "querystring";

const openchainEndpoint = "https://api.openchain.xyz/signature-database/v1/lookup";

const fetchSignaturesFromOpenChain = async (hashSignatures: string[]): Promise<Signature[]> => {
    if (hashSignatures.length === 0) return [];
    try {
        const response = await fetch(
            `${openchainEndpoint}?${qs.stringify({ function: hashSignatures.join(","), filter: true })}`
        );

        const data = await response.json();

        if (!data.ok) {
            throw new Error(`Failed to fetch signatures: ${JSON.stringify(data)}`);
        }

        return hashSignatures.map((hex, id) => ({
            id,
            text_signature: data.result.function[hex] ? data.result.function[hex][0].name : null,
            hex_signature: hex,
        }));
    } catch (error) {
        throw error;
    }
};

export const fetchFunctionTextSignaturesFromPublicDatabases = async (
    hashSignatures: string[]
): Promise<Signature[]> => {
    try {
        return await fetchSignaturesFromOpenChain(hashSignatures);
    } catch (error) {
        throw error;
    }
};
