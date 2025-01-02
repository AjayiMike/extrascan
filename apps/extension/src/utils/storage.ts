import { ModelProvider, ModelApiKeys } from "@extrascan/shared/types";

export async function getStoredApiKeys(): Promise<ModelApiKeys> {
    const result = await chrome.storage.sync.get(Object.values(ModelProvider));
    return Object.values(ModelProvider).reduce((acc, provider) => {
        acc[provider] = result[provider] || "";
        return acc;
    }, {} as ModelApiKeys);
}

export const setStoredApiKey = async (provider: ModelProvider, key: string): Promise<void> => {
    try {
        const currentKeys = await getStoredApiKeys();
        await chrome.storage.local.set({
            apiKeys: {
                ...currentKeys,
                [provider]: key,
            },
        });
    } catch (error) {
        console.error("Error setting API key:", error);
    }
};
