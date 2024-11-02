export const debounce = (func: Function, wait: number) => {
    let timeout: number | null = null;
    return (...args: any[]) => {
        if (timeout !== null) {
            globalThis.clearTimeout(timeout);
        }
        timeout = globalThis.setTimeout(() => {
            func(...args);
        }, wait) as unknown as number;
    };
};
