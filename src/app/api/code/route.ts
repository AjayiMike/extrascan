import { getBytecode } from "@/utils/bytecode";
import { loadCodeFromEtherscan } from "@/utils/code ";
import { getContractCreationInfo } from "@/utils/contractCreationBlock";
import { NextRequest, NextResponse } from "next/server";
import { getCachedData, setCachedData } from "@/utils/redisCache";

export async function POST(request: NextRequest) {
    try {
        const { networkId, address } = await request.json();
        const cacheKey = `code:${address}-${networkId}`;
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData, { status: 200 }); // Cache hit, return 200 OK
        }
        const contractCodeData = await loadCodeFromEtherscan(networkId, address);
        if (contractCodeData.error) return new Response(JSON.stringify(contractCodeData.error), { status: 200 });
        const bytecode = await getBytecode(networkId, address);
        const { blockNumber, deployer } = await getContractCreationInfo(networkId, address);
        const responseData = { ...contractCodeData.data, bytecode, startBlock: blockNumber, deployer };

        // Store the result in Redis with an expiration time (e.g., 1 hour)
        await setCachedData(cacheKey, responseData, 3600);
        const response = NextResponse.json(responseData, { status: 200 });

        return response;
    } catch (error) {
        console.error("an error occured: ", error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}
