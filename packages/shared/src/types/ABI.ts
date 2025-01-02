import type { JsonFragmentType, Result } from "ethers";

export type ContractAbiItemInput = JsonFragmentType & { fieldType?: "native_coin" };

export type ContractMethodFormFields = Record<string, string | boolean | undefined>;

export type ContractMethodResult = {
    error: string | null;
    result: Result | null;
};
