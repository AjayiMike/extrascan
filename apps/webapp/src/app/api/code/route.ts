import { getBytecode } from "@extrascan/shared/utils";
import { loadCodeFromEtherscan } from "@extrascan/shared/utils";
import { getContractCreationInfo } from "@extrascan/shared/utils";
import { RedisCache } from "@extrascan/shared/utils";
import { generateCacheKey, CacheKeyPrefix } from "@extrascan/shared/utils";

export async function POST(request: Request) {
    try {
        const { networkId, address } = await request.json();

        // const redisCache = new RedisCache(
        //     process.env.REDIS_HOST as string,
        //     Number(process.env.REDIS_PORT),
        //     process.env.REDIS_PASSWORD as string
        // );

        // const cacheKey = generateCacheKey(CacheKeyPrefix.CODE, {
        //     address,
        //     networkId,
        // });

        // const cachedData = await redisCache.getCachedData(cacheKey);

        // if (cachedData) {
        //     return Response.json(cachedData, { status: 200 });
        // }

        const contractCodeData = await loadCodeFromEtherscan(
            process.env.ETHERSCAN_API_KEY as string,
            networkId,
            address
        );

        if (contractCodeData.error) return Response.json({ error: contractCodeData.error.message }, { status: 200 });
        const bytecode = await getBytecode(networkId, address);
        const { blockNumber, deployer } = await getContractCreationInfo(
            process.env.ETHERSCAN_API_KEY as string,
            networkId,
            address
        );
        const responseData = { ...contractCodeData.data, bytecode, startBlock: blockNumber, deployer };

        // Store the result in Redis with an expiration time (e.g., 1 hour)
        // await redisCache.setCachedData(cacheKey, responseData, 3600);
        return Response.json(responseData, { status: 200 });
    } catch (error: any) {
        console.debug("an error occured: ", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
