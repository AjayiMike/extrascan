import type { JsonFragment } from "ethers";
import { getFunctionSignatureFromFragment } from "./contractfunctions";

export const getFragmentConfidenceScore = (
    confidenceScores: { [key: string]: number } | undefined,
    fragment: JsonFragment
): number | undefined => {
    if (!confidenceScores) return undefined;

    const key = getFunctionSignatureFromFragment(fragment);

    return confidenceScores[key];
};
