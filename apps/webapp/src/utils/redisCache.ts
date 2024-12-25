import Redis from "ioredis";

const redis = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
});

// Function to get cached data
export const getCachedData = async (key: string) => {
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
};

// Function to set cached data with an expiration time
export const setCachedData = async (key: string, data: any, expirationInSeconds: number) => {
    await redis.set(key, JSON.stringify(data), "EX", expirationInSeconds);
};
