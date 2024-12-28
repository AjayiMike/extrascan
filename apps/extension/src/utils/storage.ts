import { ModelProvider } from "@extrascan/shared/types";

export type StorageKeys = {
    [key in ModelProvider]?: string;
};

export const getStoredApiKeys = async (): Promise<StorageKeys> => {
    try {
        const result = await chrome.storage.local.get("apiKeys");
        return result.apiKeys || {};
    } catch (error) {
        console.error("Error getting API keys:", error);
        return {};
    }
};

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
