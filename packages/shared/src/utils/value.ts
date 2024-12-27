export const formatLargeValue = (value: number, excludeFraction = false): string => {
    if (excludeFraction) {
        return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }

    return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
};
