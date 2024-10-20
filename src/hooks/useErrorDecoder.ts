import { FragmentType } from "@/constant/fragment";
import { Interface } from "ethers";
import { JsonFragment } from "ethers";
import { ErrorDecoder } from "ethers-decode-error";
import { useMemo } from "react";

const useErrorDecoder = (interfaceOrAbi: Interface | JsonFragment[] | undefined): ErrorDecoder => {
    const errorFragments: JsonFragment[] = useMemo(() => {
        if (!interfaceOrAbi) return [];
        const abi: JsonFragment[] =
            interfaceOrAbi instanceof Interface ? JSON.parse(interfaceOrAbi.formatJson()) : interfaceOrAbi;
        return abi.filter((fragment) => fragment.type === FragmentType.ERROR);
    }, [interfaceOrAbi]);

    return useMemo(() => {
        return ErrorDecoder.create([errorFragments]);
    }, [errorFragments]);
};

export default useErrorDecoder;
