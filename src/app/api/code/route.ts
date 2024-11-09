import { getBytecode } from "@/utils/bytecode";
import { loadCodeFromEtherscan } from "@/utils/code ";
import { getContractCreationInfo } from "@/utils/contractCreationBlock";
import { getCachedData, setCachedData } from "@/utils/redisCache";

export async function POST(request: Request) {
    try {
        const { networkId, address } = await request.json();

        const cacheKey = `code:${address}-${networkId}`;
        const cachedData = await getCachedData(cacheKey);

        if (cachedData) {
            return Response.json(cachedData, { status: 200 });
        }

        const contractCodeData = await loadCodeFromEtherscan(networkId, address);

        if (contractCodeData.error) return Response.json({ error: contractCodeData.error.message }, { status: 200 });
        const bytecode = await getBytecode(networkId, address);
        const { blockNumber, deployer } = await getContractCreationInfo(networkId, address);
        const responseData = { ...contractCodeData.data, bytecode, startBlock: blockNumber, deployer };

        // Store the result in Redis with an expiration time (e.g., 1 hour)
        await setCachedData(cacheKey, responseData, 3600);
        return Response.json(responseData, { status: 200 });
    } catch (error: any) {
        console.debug("an error occured: ", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
