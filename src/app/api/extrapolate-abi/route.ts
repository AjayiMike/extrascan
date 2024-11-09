import { getBytecode } from "@/utils/bytecode";
import { getContractCreationInfo } from "@/utils/contractCreationBlock";
import { fetchFunctionTextSignaturesFromPublicDatabases } from "@/utils/functionSignature";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { whatsabi } from "@shazow/whatsabi";
import { getCachedData, setCachedData } from "@/utils/redisCache";
import { isAddress } from "@/utils/address";
import { getAddress } from "ethers";
import { getSupportedNetworks } from "@/config/network";
import { validateExtrapolatedABI } from "@/utils/validate";

const { GoogleGenerativeAI } = require("@google/generative-ai");

export async function POST(request: Request) {
    const { networkId, address } = await request.json();
    if (!isAddress(address)) return Response.json({ error: "Invalid address" }, { status: 400 });
    if (typeof networkId !== "number")
        return Response.json({ error: "Invalid networkId, must be a number" }, { status: 400 });
    const supportedNetworks = await getSupportedNetworks();
    if (supportedNetworks.findIndex((network) => network.chainId === Number(networkId)) === -1)
        return Response.json({ error: "Unsupported network" }, { status: 400 });

    const cacheKey = `extrapolated:${getAddress(address)}-${networkId}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return Response.json(cachedData, { status: 200 });
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

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings,
        systemInstruction: `You are a smart contract ABI FRAGMENTS Extrapolator AI Agent.
        
        Drawing knowledge from popular smart contract standards and conventions,
        your role is to extrapolate the full fragments of the functions in the array based on the name and input types of the functions.
        
        You are to output a json text with two things ONLY and nothing else:
        1 - The ABI containing the fragments in json format, and
        2 -  A confidence score object, representing how confident you are about each extrapolated fragment.
        
        The keys of the confidence score object should be the name of the function and its input types and the value should be a number between 0 and 1, depending on how confident you are about the extrapolated fragments.
        
        The ABI is expected to be a valid json. Below is an example:
        
        Input: ["approve(address, uint256)","balanceOf(address)"]
        Output: "{ABI: [{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}], confidence: {"approve(address, uint256)": 0.35, "balanceOf(address)": 0.59}}"`,
    });

    try {
        const bytecode = await getBytecode(networkId, address);
        const selectors = whatsabi.selectorsFromBytecode(bytecode);
        if (!selectors.length)
            return Response.json({ error: "No function selectors found in bytecode" }, { status: 400 });
        const functionTextSignatureData = await fetchFunctionTextSignaturesFromPublicDatabases(selectors);

        // hex signatures for which corresponding text signature are not found
        // const notFound = functionTextSignatureData
        //     .filter((x, idx) => x.text_signature === null)
        //     .map((x) => x.hex_signature);

        const functionTextSignature = functionTextSignatureData
            .filter((x) => x.text_signature !== null)
            .map((x) => x.text_signature);

        if (!functionTextSignature.length)
            return Response.json(
                { error: "Function signatures not found in public database" },
                {
                    status: 400,
                }
            );
        const result = await model.generateContent(functionTextSignature, generationConfig);
        const response = await result.response;
        const responseText = response.text();

        const jsonObject = JSON.parse(responseText.replace(/```json\n|```/g, ""));
        const ABI = JSON.stringify(jsonObject.ABI);
        const ABIConfidenceScores = jsonObject.confidence;
        const { blockNumber, deployer } = await getContractCreationInfo(networkId, address);

        const valid = validateExtrapolatedABI(ABI, ABIConfidenceScores);

        if (!valid) throw new Error("Error extrapolating ABI, please try again later");

        const responseData = { ABI, ABIConfidenceScores, startBlock: blockNumber, deployer, address };
        await setCachedData(cacheKey, responseData, 3600);

        return Response.json(responseData, { status: 200 });
    } catch (error: any) {
        console.debug("Something went wrong: ", error);
        return Response.json(
            { error: error?.message || "Something went wrong, please try again later" },
            { status: 400 }
        );
    }
}
