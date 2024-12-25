"use client";
import { useContract } from "@/hooks/useContract";
import { escapeRegExp, numberInputRegex } from "@/utils/regex";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { DecodedError, ErrorDecoder } from "ethers-decode-error";
import { Contract, JsonFragment } from "ethers";
import useErrorDecoder from "@/hooks/useErrorDecoder";
import { getFragmentConfidenceScore } from "@/utils/confidenceScore";
import ContractFunctionSimpleInputField from "./inputComponents/ContractFunctionSimpleInputField";
import {
    getFieldLabel,
    getFunctionSignatureFromFragment,
    isReadMethod,
    matchArray,
    transformFormDataToMethodArgs,
} from "@/utils/contractfunctions";
import { ContractAbiItemInput, ContractMethodFormFields, ContractMethodResult } from "@/types/ABI";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import ContractFunctionFieldAccordion from "./inputComponents/ContractFunctionFieldAccordion";
import ContractFunctionArrayInputField from "./inputComponents/ContractFunctionArrayInputField";
import ContractFunctionTupleInputField from "./inputComponents/ContractFunctionTupleInputField";
import { Icon } from "@iconify/react";

type Props = {
    networkId: number;
    address: string | null;
    ABI?: string;
    ABIConfidenceScores?: { [key: string]: number };
    startBlock?: number;
};

const ReadContractFunctions: React.FC<Props> = ({ address, ABI, networkId, ABIConfidenceScores, startBlock }) => {
    const [blockNumber, setBlockNumber] = useState<number | null>(null);

    const parsedABI = JSON.parse(ABI ?? "[]");

    const readOnlyFunctionFragments: ReadonlyArray<JsonFragment> = parsedABI.filter(isReadMethod);

    const contractInstance = useContract(address as string, parsedABI, networkId, false);

    const errorDecoder = useErrorDecoder(contractInstance?.interface);

    return (
        <div className="w-full mt-6">
            <div className="flex gap-4">
                <h2 className="text-xl font-semibold">Contract Read Functions</h2>
                <details className="w-48">
                    <summary className="cursor-pointer selection:bg-transparent">From Block</summary>
                    <input
                        type="number"
                        className="w-full p-2 rounded-md border bg-gray-200 outline-none text-sm"
                        placeholder="latest"
                        min={startBlock || 0}
                        pattern="^[0-9]*[.,]?[0-9]*$"
                        onKeyDown={(evt) => ["e", "E", "+", "-", "."].includes(evt.key) && evt.preventDefault()}
                        value={blockNumber || ""}
                        onChange={(event) => {
                            const nextUserInput = event.target.value.replace(/,/g, ".");
                            if (nextUserInput === "" || numberInputRegex.test(escapeRegExp(nextUserInput))) {
                                setBlockNumber(!Number.isNaN(parseInt(nextUserInput)) ? parseInt(nextUserInput) : null);
                            }
                        }}
                    />
                </details>
            </div>

            <div className="w-full mt-4">
                {readOnlyFunctionFragments.map((func: JsonFragment, index: number) => {
                    return (
                        <ReadMethod
                            key={`${func.name}-${index}`}
                            fragment={func}
                            contractInstance={contractInstance}
                            blockNumber={blockNumber}
                            errorDecoder={errorDecoder}
                            confidenceScores={getFragmentConfidenceScore(ABIConfidenceScores, func)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const ReadMethod: React.FC<{
    fragment: JsonFragment;
    contractInstance: Contract | null;
    confidenceScores?: number;
    blockNumber: number | null;
    errorDecoder: ErrorDecoder;
}> = ({ fragment, contractInstance, confidenceScores, blockNumber, errorDecoder }) => {
    const name = fragment.name;
    const inputs: ContractAbiItemInput[] | undefined = useMemo(() => {
        return [
            ...("inputs" in fragment && fragment.inputs ? fragment.inputs : []),
            ...("stateMutability" in fragment && fragment.stateMutability === "payable"
                ? [
                      {
                          name: "Send native",
                          type: "uint256" as const,
                          internalType: "uint256" as const,
                          fieldType: "native_coin" as const,
                      },
                  ]
                : []),
        ];
    }, [fragment]);
    const [result, setResult] = useState<ContractMethodResult>();
    const [isLoading, setIsLoading] = useState(false);

    const formApi = useForm<ContractMethodFormFields>({
        mode: "all",
        shouldUnregister: true,
    });

    const callFunction = useCallback(
        async (args: Array<unknown>, fragment: JsonFragment) => {
            if (!contractInstance) return console.debug("Contract instance not found");
            if (!("name" in fragment)) {
                throw new Error("Unknown contract method");
            }
            const _args = args.slice(0, fragment?.inputs?.length);

            if (_args.length !== fragment?.inputs?.length) {
                throw new Error("Invalid number of arguments");
            }

            const res = await contractInstance[`${getFunctionSignatureFromFragment(fragment)}`](..._args, {
                blockTag: blockNumber ?? "latest",
            });

            return res;
        },
        [blockNumber, contractInstance]
    );

    const onFormSubmit: SubmitHandler<ContractMethodFormFields> = useCallback(
        async (formData) => {
            try {
                const args = transformFormDataToMethodArgs(formData);
                setResult(undefined);
                setIsLoading(true);

                const res = await callFunction(args, fragment);

                setResult({ result: res, error: null });
            } catch (error: unknown) {
                console.debug("error: ", JSON.stringify(error, null, 2));
                const decodedError: DecodedError = await errorDecoder.decode(error);
                setResult({ result: null, error: decodedError.reason || "Unknow error" });
            } finally {
                setIsLoading(false);
            }
        },
        [callFunction, errorDecoder, fragment]
    );

    const handleFormChange = useCallback(() => {
        result && setResult(undefined);
    }, [result]);

    const hasConstantOutputs = isReadMethod(fragment) && fragment?.inputs?.length === 0;

    return (
        <Disclosure as="div" className="w-full mt-4 rounded-md border-2 border-gray-200">
            <DisclosureButton
                as="div"
                className="w-full flex items-center justify-between bg-gray-200 p-2"
                onClick={(e: any) => {
                    if (hasConstantOutputs) {
                        e.stopPropagation();
                        onFormSubmit({});
                    }
                }}
            >
                {({ open }) => (
                    <Fragment>
                        <span>
                            <span>{name}</span>
                            {confidenceScores && (
                                <span className="text-[10px] text-gray-200 ml-2 bg-cyan-800/50 rounded-full px-[6px] py-[2px]">
                                    {confidenceScores}
                                </span>
                            )}
                        </span>
                        {hasConstantOutputs ? (
                            <button
                                className="mt-2 py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50"
                                onClick={(e) => {
                                    if (open) {
                                        e.stopPropagation();
                                    }
                                    onFormSubmit({});
                                }}
                            >
                                Query
                            </button>
                        ) : (
                            <Icon icon={open ? "mdi-light:chevron-down" : "material-symbols-light:chevron-right"} />
                        )}
                    </Fragment>
                )}
            </DisclosureButton>
            <DisclosurePanel className="">
                <div className="p-2 overflow-auto">
                    <FormProvider {...formApi}>
                        <form noValidate onSubmit={formApi.handleSubmit(onFormSubmit)} onChange={handleFormChange}>
                            {inputs.map((input, i) => {
                                const props = {
                                    data: input,
                                    basePath: `${i}`,
                                    isDisabled: isLoading,
                                    level: 0,
                                };
                                const arrayMatch = matchArray(input.type as string);

                                if ("components" in input && input.components && input.type === "tuple") {
                                    return <ContractFunctionTupleInputField key={i} {...props} />;
                                }

                                if (arrayMatch) {
                                    if (arrayMatch.isNested) {
                                        const fieldsWithErrors = Object.keys(formApi.formState.errors);
                                        const isInvalid = fieldsWithErrors.some((field) => field.startsWith(i + ":"));
                                        return (
                                            <ContractFunctionFieldAccordion
                                                key={i}
                                                level={0}
                                                label={getFieldLabel(input)}
                                                isInvalid={isInvalid}
                                            >
                                                <ContractFunctionArrayInputField {...props} />
                                            </ContractFunctionFieldAccordion>
                                        );
                                    }
                                    return <ContractFunctionArrayInputField key={i} {...props} />;
                                }

                                return <ContractFunctionSimpleInputField key={i} {...props} path={`${i}`} />;
                            })}
                            {!hasConstantOutputs && (
                                <button
                                    className="mt-2 py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50"
                                    type="submit"
                                >
                                    Query
                                </button>
                            )}

                            {isLoading ? (
                                <p className="p-2">fetching...</p>
                            ) : result && result.result !== null ? (
                                <p className="p-2">{String(result?.result)}</p>
                            ) : result?.error ? (
                                <p className="p-2 text-red-600">{result.error}</p>
                            ) : null}
                        </form>
                    </FormProvider>
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
};

export default ReadContractFunctions;
