import { BigNumber } from "@ethersproject/bignumber";

/**
 * Returns the gas value plus a 20% margin for unexpected or variable gas costs
 * @param value the gas value to pad
 */
export function calculateGasMargin(value: BigNumber): BigNumber {
    return value.mul(150).div(100);
}
