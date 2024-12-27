import Redis from "ioredis";

export class RedisCache {
    private redis: Redis;

    constructor(host: string, port: number, password: string) {
        this.redis = new Redis({
            host,
            port,
            password,
        });
    }

    // Function to get cached data
    async getCachedData(key: string) {
        const cachedData = await this.redis.get(key);
        return cachedData ? JSON.parse(cachedData) : null;
    }

    // Function to set cached data with an expiration time
    async setCachedData(key: string, data: any, expirationInSeconds: number) {
        await this.redis.set(key, JSON.stringify(data), "EX", expirationInSeconds);
    }
}
