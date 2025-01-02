import { getAddress } from "ethers";
import { createHash } from "crypto";

export enum CacheKeyPrefix {
    EXTRAPOLATED = "extrapolated",
    CODE = "code",
    // Add other prefixes as needed
}

export function generateCacheKey(
    prefix: CacheKeyPrefix,
    params: {
        bytecode?: string;
        address?: string;
        networkId?: number;
    }
): string {
    const { bytecode, address, networkId } = params;

    if (bytecode) {
        // Create SHA-256 hash of the entire bytecode and use the full hash
        const bytecodeHash = createHash("sha256").update(bytecode).digest("hex");
        return `${prefix}:bytecode:${bytecodeHash}`;
    }

    if (address && networkId) {
        return `${prefix}:${getAddress(address)}-${networkId}`;
    }

    throw new Error("Invalid parameters for cache key generation");
}
