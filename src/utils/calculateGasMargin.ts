/**
 * Returns the gas value plus a 20% margin for unexpected or variable gas costs
 * @param value the gas value to pad
 */
export function calculateGasMargin(value: bigint): bigint {
    return (value * BigInt(150)) / BigInt(100);
}
