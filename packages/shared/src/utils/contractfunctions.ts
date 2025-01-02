import type { ContractAbiItemInput, ContractMethodFormFields } from "@/types/ABI";
import type { JsonFragment, JsonFragmentType } from "ethers";
import _set from "lodash/set";

export const INT_REGEXP = /^(u)?int(\d+)?$/i;

export const BYTES_REGEXP = /^bytes(\d+)?$/i;

export const ARRAY_REGEXP = /^(.*)\[(\d*)\]$/;

export const getIntBoundaries = (power: number, isUnsigned: boolean) => {
    const maxUnsigned = BigInt(2 ** power);
    const max = isUnsigned ? maxUnsigned - BigInt(1) : maxUnsigned / BigInt(2) - BigInt(1);
    const min = isUnsigned ? BigInt(0) : -maxUnsigned / BigInt(2);
    return [min, max];
};

export interface MatchArray {
    itemType: string;
    size: number;
    isNested: boolean;
}

export const matchArray = (argType: string): MatchArray | null => {
    const match = argType.match(ARRAY_REGEXP);
    if (!match) {
        return null;
    }

    const [, itemType, size] = match;
    const isNested = Boolean(matchArray(itemType));

    return {
        itemType,
        size: size ? Number(size) : Infinity,
        isNested,
    };
};

export interface MatchInt {
    isUnsigned: boolean;
    power: string;
    min: bigint;
    max: bigint;
}

export const matchInt = (argType: string): MatchInt | null => {
    const match = argType.match(INT_REGEXP);
    if (!match) {
        return null;
    }

    const [, isUnsigned, power = "256"] = match;
    const [min, max] = getIntBoundaries(Number(power), Boolean(isUnsigned));

    return { isUnsigned: Boolean(isUnsigned), power, min, max };
};

export const isMethod = (method: JsonFragment): boolean =>
    method.type === "function" || method.type === "fallback" || method.type === "receive";

export const isReadMethod = (method: JsonFragment): boolean =>
    method.type === "function" &&
    (method.constant || method.stateMutability === "view" || method.stateMutability === "pure");

export const isWriteMethod = (method: JsonFragment): boolean =>
    (method.type === "function" || method.type === "fallback" || method.type === "receive") && !isReadMethod(method);

export function getFieldLabel(input: ContractAbiItemInput, isRequired?: boolean) {
    const name = input.name || input.internalType || "<unnamed argument>";
    return `${name} (${input.type})${isRequired ? "*" : ""}`;
}

export const transformDataForArrayItem = (data: ContractAbiItemInput, index: number): ContractAbiItemInput => {
    const arrayMatchType = matchArray(data.type as string);
    const arrayMatchInternalType = data.internalType ? matchArray(data.internalType) : null;
    const childrenInternalType = arrayMatchInternalType?.itemType.replaceAll("struct ", "");

    const postfix = childrenInternalType ? " " + childrenInternalType : "";

    return {
        ...data,
        type: arrayMatchType?.itemType || data.type,
        internalType: childrenInternalType,
        name: `#${index + 1}${postfix}`,
    };
};

export function transformFormDataToMethodArgs(formData: ContractMethodFormFields) {
    const result: Array<unknown> = [];

    for (const field in formData) {
        const value = formData[field];
        _set(result, field.replaceAll(":", "."), value);
    }

    const filteredResult = filterOutEmptyItems(result);
    const mappedResult = mapEmptyNestedArrays(filteredResult);
    return mappedResult;
}

function filterOutEmptyItems(array: Array<unknown>): Array<unknown> {
    // The undefined value may occur in two cases:
    //    1. When an optional form field is left blank by the user.
    //        The only optional field is the native coin value, which is safely handled in the form submit handler.
    //    2. When the user adds and removes items from a field array.
    //        In this scenario, empty items need to be filtered out to maintain the correct sequence of arguments.
    // We don't use isEmptyField() function here because of the second case otherwise it will not keep the correct order of arguments.
    return array
        .map((item) => (Array.isArray(item) ? filterOutEmptyItems(item) : item))
        .filter((item) => item !== undefined);
}

function isEmptyField(field: unknown): boolean {
    // the empty string is meant that the field was touched but left empty
    // the undefined is meant that the field was not touched
    return field === undefined || field === "";
}

function isEmptyNestedArray(array: Array<unknown>): boolean {
    return array.flat(Infinity).filter((item) => !isEmptyField(item)).length === 0;
}

function mapEmptyNestedArrays(array: Array<unknown>): Array<unknown> {
    return array.map((item) => (Array.isArray(item) && isEmptyNestedArray(item) ? [] : item));
}

export function getFunctionSignatureFromFragment(fragment: JsonFragment): string {
    const inputs = fragment.inputs || [];
    const getTypeString = (input: JsonFragmentType): string => {
        if (input.type === "tuple" && input.components) {
            const componentTypes = input.components.map(getTypeString);
            return `(${componentTypes.join(",")})${input.type.endsWith("[]") ? "[]" : ""}`;
        }
        if (input.type?.includes("[]")) {
            const baseType = input.type.slice(0, -2);
            if (baseType === "tuple" && input.components) {
                const componentTypes = input.components.map(getTypeString);
                return `(${componentTypes.join(",")})[]`;
            }
        }
        return input.type || "";
    };

    const inputTypes = inputs.map(getTypeString);
    return `${fragment.name}(${inputTypes.join(",")})`;
}
