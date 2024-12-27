import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { ModelApiKeys } from "@/types/models";
import { ModelProvider } from "@/types/models";

interface ExtrapolationResult {
    ABI: string;
    confidence: Record<string, number>;
}

const SYSTEM_PROMPT = `You are a smart contract ABI FRAGMENTS Extrapolator AI Agent.
        
        Drawing knowledge from popular smart contract standards and conventions,
        your role is to extrapolate the full fragments of the functions in the array based on the name and input types of the functions.
        
        You are to output a json text with two things ONLY and nothing else:
        1 - The ABI containing the fragments in json format, and
        2 -  A confidence score object, representing how confident you are about each extrapolated fragment.
        
        The keys of the confidence score object should be the name of the function and its input types and the value should be a number between 0 and 1, depending on how confident you are about the extrapolated fragments.
        
        The ABI is expected to be a valid json. Below is an example:
        
        Input: ["approve(address, uint256)","balanceOf(address)"]
        Output: "{ABI: [{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}], confidence: {"approve(address, uint256)": 0.35, "balanceOf(address)": 0.59}}"`;

export class ModelProviderService {
    private geminiModel;
    private openaiClient;
    private anthropicClient;
    private availableProviders: ModelProvider[] = [];

    constructor(apiKeys: ModelApiKeys) {
        if (apiKeys[ModelProvider.GEMINI]) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            this.geminiModel = new GoogleGenerativeAI(apiKeys[ModelProvider.GEMINI]).getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: SYSTEM_PROMPT,
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
            });
            this.availableProviders.push(ModelProvider.GEMINI);
        }

        if (apiKeys[ModelProvider.OPENAI]) {
            this.openaiClient = new OpenAI({ apiKey: apiKeys[ModelProvider.OPENAI] });
            this.availableProviders.push(ModelProvider.OPENAI);
        }

        if (apiKeys[ModelProvider.ANTHROPIC]) {
            this.anthropicClient = new Anthropic({ apiKey: apiKeys[ModelProvider.ANTHROPIC] });
            this.availableProviders.push(ModelProvider.ANTHROPIC);
        }

        if (this.availableProviders.length === 0) {
            throw new Error("No valid API keys provided");
        }
    }

    private async extrapolateWithGemini(signatures: string[]): Promise<ExtrapolationResult> {
        if (!this.geminiModel) throw new Error("Gemini API key not provided");

        const result = await this.geminiModel.generateContent(signatures, {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        });

        const response = await result.response;
        const text = response.text();
        return JSON.parse(text.replace(/```json\n|```/g, ""));
    }

    private async extrapolateWithOpenAI(signatures: string[]): Promise<ExtrapolationResult> {
        if (!this.openaiClient) throw new Error("OpenAI API key not provided");

        const completion = await this.openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: signatures.join("\n") },
            ],
            temperature: 1,
        });

        return JSON.parse(completion.choices[0].message.content || "");
    }

    private async extrapolateWithAnthropic(signatures: string[]): Promise<ExtrapolationResult> {
        if (!this.anthropicClient) throw new Error("Anthropic API key not provided");

        const message = await this.anthropicClient.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 2048,
            temperature: 1,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: signatures.join("\n") }],
        });

        return JSON.parse((message.content[0] as any).text);
    }

    async extrapolateABI(signatures: string[], preferredProvider?: ModelProvider): Promise<ExtrapolationResult> {
        // If preferred provider is specified and available, use only that
        if (preferredProvider && this.availableProviders.includes(preferredProvider)) {
            const result = await this.tryProvider(preferredProvider, signatures);
            if (result) return result;
            throw new Error(`Failed to extrapolate using preferred provider: ${preferredProvider}`);
        }

        // Otherwise, try all available providers in priority order
        const priorityOrder = [ModelProvider.ANTHROPIC, ModelProvider.OPENAI, ModelProvider.GEMINI];
        const providersToTry = priorityOrder.filter((p) => this.availableProviders.includes(p));

        let lastError: Error | null = null;
        for (const provider of providersToTry) {
            try {
                const result = await this.tryProvider(provider, signatures);
                if (result) return result;
            } catch (error) {
                lastError = error as Error;
                console.error(`Error with ${provider}:`, error);
                continue;
            }
        }

        throw lastError || new Error("All available providers failed");
    }

    private async tryProvider(provider: ModelProvider, signatures: string[]): Promise<ExtrapolationResult | null> {
        switch (provider) {
            case ModelProvider.GEMINI:
                return await this.extrapolateWithGemini(signatures);
            case ModelProvider.OPENAI:
                return await this.extrapolateWithOpenAI(signatures);
            case ModelProvider.ANTHROPIC:
                return await this.extrapolateWithAnthropic(signatures);
            default:
                return null;
        }
    }
}

export default ModelProviderService;
