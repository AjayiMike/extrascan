export function validateExtrapolatedABI(extrapolatedAbi: any, confidenceScores: Record<string, number>): boolean {
    try {
        // Check if extrapolatedAbi is an array
        if (!Array.isArray(extrapolatedAbi)) return false;

        // Validate each function in the ABI
        for (const item of extrapolatedAbi) {
            // Check required fields
            if (!item.name || !item.inputs || !item.outputs || !item.stateMutability) {
                return false; // Missing required fields
            }

            // Validate inputs
            if (!Array.isArray(item.inputs)) return false; // Inputs should be an array
            for (const input of item.inputs) {
                if (!input.internalType || !input.type) {
                    return false; // Missing required fields in input
                }
                if (input.components) {
                    if (!Array.isArray(input.components)) return false; // Components should be an array
                    for (const component of input.components) {
                        if (!component.internalType || !component.type) {
                            return false; // Missing required fields in component
                        }
                    }
                }
            }

            // Validate outputs
            if (!Array.isArray(item.outputs)) return false; // Outputs should be an array
            for (const output of item.outputs) {
                if (!output.internalType || !output.type) {
                    return false; // Missing required fields in output
                }
            }

            // Validate stateMutability
            const validStateMutabilities = ["pure", "view", "nonpayable", "payable"];
            if (!validStateMutabilities.includes(item.stateMutability)) {
                return false; // Invalid state mutability
            }
        }

        // Validate confidence scores
        for (const key in confidenceScores) {
            if (typeof confidenceScores[key] !== "number" || confidenceScores[key] < 0 || confidenceScores[key] > 1) {
                return false; // Invalid confidence score
            }
        }

        return true; // Validation passed
    } catch (error) {
        return false; // JSON parsing failed
    }
}
