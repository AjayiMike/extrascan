import { JsonFragment } from "ethers";

export const getFragmentConfidenceScore = (
    confidenceScores: { [key: string]: number } | undefined,
    fragment: JsonFragment
): number | undefined => {
    if (!confidenceScores) return undefined;
    const fragmentName = fragment.name;
    if (!fragment.inputs?.length) return confidenceScores[`${fragmentName}()`];

    const inputTypes = fragment.inputs.map((input) => input.type).join(",");
    return confidenceScores[`${fragmentName}(${inputTypes})`];
};
