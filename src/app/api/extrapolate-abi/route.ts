import { getBytecode } from "@/utils/bytecode";
import { getContractCreationInfo } from "@/utils/contractCreationBlock";
import { fetchFunctionTextSignaturesFromPublicDatabases } from "@/utils/functionSignature";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { whatsabi } from "@shazow/whatsabi";
import { NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/utils/redisCache";

const { GoogleGenerativeAI } = require("@google/generative-ai");

export async function POST(request: Request) {
    const { apiKey, networkId, address } = await request.json();

    if (!apiKey) return new Response("API Key is required", { status: 400 });

    const cacheKey = `extrapolated:${address}-${networkId}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return NextResponse.json(cachedData, { status: 200 });
    }

    const safetySettings = [
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
    ];

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
    };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings,
        systemInstruction:
            'You are a smart contract ABI FRAGMENTS Predictor AI Agent. your role is to predict the full fragment of the functions in the array based on the name and input types of the functions. rely on popular smart contract standards and conventions. you are to output ONLY the json abi containing the fragments and nothing else. the abi is expected to be a valid json. below is an example:\nInput: ["approve(address, uint256)","balanceOf(address)"]\nOutput: [{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]',
    });

    try {
        const bytecode = await getBytecode(networkId, address);
        const selectors = whatsabi.selectorsFromBytecode(bytecode);
        const functionTextSignatureData = await fetchFunctionTextSignaturesFromPublicDatabases(selectors);

        // hex signatures for which corresponding text signature are not found
        // const notFound = functionTextSignatureData
        //     .filter((x, idx) => x.text_signature === null)
        //     .map((x) => x.hex_signature);

        const functionTextSignature = functionTextSignatureData
            .filter((x) => x.text_signature !== null)
            .map((x) => x.text_signature);

        const result = await model.generateContent(functionTextSignature, generationConfig);
        const response = await result.response;
        const ABI = response.text();
        const { blockNumber, deployer } = await getContractCreationInfo(networkId, address);
        // Prepare data to cache
        const responseData = { bytecode, ABI, startBlock: blockNumber, deployer, address };

        // Store the result in Redis with an expiration time (e.g., 1 hour)
        await setCachedData(cacheKey, responseData, 3600);

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error("an error occured: ", error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}
