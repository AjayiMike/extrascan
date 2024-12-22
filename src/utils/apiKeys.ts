import { LOCAL_STORAGE_NAMESPACE } from "@/constant";

export const API_KEYS_LOCALSTORAGE_KEY = `${LOCAL_STORAGE_NAMESPACE}_API_KEYS`;

type ApiKeys = {
    gemini?: string;
    openai?: string;
    anthropic?: string;
};

const API_KEY_PREFIXES = {
    gemini: "AI",
    openai: "sk-",
    anthropic: "sk-ant-",
};

export function validateApiKey(provider: keyof ApiKeys, key: string): boolean {
    if (!key) return false;
    return key.startsWith(API_KEY_PREFIXES[provider]);
}

export function getStoredApiKeys(): ApiKeys {
    if (typeof window === "undefined") return {};
    const storedKeys = localStorage.getItem(API_KEYS_LOCALSTORAGE_KEY);
    return storedKeys ? JSON.parse(storedKeys) : {};
}

export function getApiKeyForProvider(provider: keyof ApiKeys): string | undefined {
    const keys = getStoredApiKeys();
    return keys[provider];
}

export function saveApiKey(provider: keyof ApiKeys, key: string): boolean {
    if (!validateApiKey(provider, key)) {
        return false;
    }

    const currentKeys = getStoredApiKeys();
    const updatedKeys = { ...currentKeys, [provider]: key };
    localStorage.setItem(API_KEYS_LOCALSTORAGE_KEY, JSON.stringify(updatedKeys));
    return true;
}
