import { LOCAL_STORAGE_NAMESPACE } from "@/constants";
import type { ModelProvider, ModelApiKeys } from "@/types/models";
import { MODEL_KEY_PREFIXES } from "@/types/models";

export const API_KEYS_LOCALSTORAGE_KEY = `${LOCAL_STORAGE_NAMESPACE}_API_KEYS`;

export function validateApiKey(provider: ModelProvider, key: string): boolean {
    if (!key) return false;
    return key.startsWith(MODEL_KEY_PREFIXES[provider]);
}

export function getStoredApiKeys(): ModelApiKeys {
    if (typeof window === "undefined") return {};
    const storedKeys = localStorage.getItem(API_KEYS_LOCALSTORAGE_KEY);
    return storedKeys ? JSON.parse(storedKeys) : {};
}

export function getApiKeyForProvider(provider: ModelProvider): string | undefined {
    const keys = getStoredApiKeys();
    return keys[provider];
}

export function saveApiKey(provider: ModelProvider, key: string): boolean {
    if (!validateApiKey(provider, key)) {
        return false;
    }

    const currentKeys = getStoredApiKeys();
    const updatedKeys = { ...currentKeys, [provider]: key };
    localStorage.setItem(API_KEYS_LOCALSTORAGE_KEY, JSON.stringify(updatedKeys));
    return true;
}
