import { ModelProvider, ModelApiKeys } from "@extrascan/shared/types";

export async function getStoredApiKeys(): Promise<ModelApiKeys> {
    const result = await chrome.storage.sync.get("apiKeys");
    return result.apiKeys || {};
}

export const setStoredApiKey = async (provider: ModelProvider, key: string): Promise<void> => {
    try {
        const currentKeys = await getStoredApiKeys();
        await chrome.storage.sync.set({
            apiKeys: {
                ...currentKeys,
                [provider]: key,
            },
        });
    } catch (error) {
        console.error("Error setting API key:", error);
    }
};
