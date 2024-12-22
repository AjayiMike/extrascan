export enum ModelProvider {
    GEMINI = "gemini",
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
}

export const SUPPORTED_PROVIDERS = [ModelProvider.GEMINI];

export interface ModelApiKeys {
    [ModelProvider.GEMINI]?: string;
    [ModelProvider.OPENAI]?: string;
    [ModelProvider.ANTHROPIC]?: string;
}

export const MODEL_KEY_PREFIXES: Record<ModelProvider, string> = {
    [ModelProvider.GEMINI]: "AI",
    [ModelProvider.OPENAI]: "sk-",
    [ModelProvider.ANTHROPIC]: "sk-ant-",
};

export const MODEL_DISPLAY_NAMES: Record<ModelProvider, string> = {
    [ModelProvider.GEMINI]: "Gemini",
    [ModelProvider.OPENAI]: "OpenAI (Coming Soon)",
    [ModelProvider.ANTHROPIC]: "Anthropic (Coming Soon)",
};
