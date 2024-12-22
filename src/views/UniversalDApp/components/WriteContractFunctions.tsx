"use client";

import { useContract } from "@/hooks/useContract";
import useErrorDecoder from "@/hooks/useErrorDecoder";
import { useNetworkDataForChainId } from "@/hooks/useSupportedNetworkData";
import { getFragmentConfidenceScore } from "@/utils/confidenceScore";
import {
    getFieldLabel,
    getFunctionSignatureFromFragment,
    isWriteMethod,
    matchArray,
    transformFormDataToMethodArgs,
} from "@/utils/contractfunctions";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { Contract } from "ethers";
import { JsonFragment } from "ethers";
import { DecodedError, ErrorDecoder } from "ethers-decode-error";
import { Fragment, useCallback, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import ContractFunctionFieldAccordion from "./inputComponents/ContractFunctionFieldAccordion";
import ContractFunctionArrayInputField from "./inputComponents/ContractFunctionArrayInputField";
import ContractFunctionSimpleInputField from "./inputComponents/ContractFunctionSimpleInputField";
import { ContractMethodFormFields, ContractMethodResult } from "@/types/ABI";
import ContractFunctionTupleInputField from "./inputComponents/ContractFunctionTupleInputField";
import { Icon } from "@iconify/react";

type Props = {
    networkId: number;
    address: string | null;
    ABI?: string;
    ABIConfidenceScores?: { [key: string]: number };
};
const WriteContractFunctions: React.FC<Props> = ({ networkId, address, ABI, ABIConfidenceScores }) => {
    const parsedABI = JSON.parse(ABI ?? "[]");
    const writeOnlyFunctionFragments: ReadonlyArray<JsonFragment> = parsedABI.filter(isWriteMethod);
    const networkData = useNetworkDataForChainId(networkId);
    const { chainId } = useAppKitNetwork();
    const { address: account } = useAppKitAccount();

    const contractInstance = useContract(address as string, parsedABI, networkId);
    const errorDecoder = useErrorDecoder(contractInstance?.interface);

    const isOnWrongNetwork = chainId !== networkId;

    return (
        <div className="w-full mt-6">
            <div className="flex flex-col md:flex-row md:gap-4 md:items-center">
                <h2 className="text-xl font-semibold">Contract Write Functions</h2>
                <span className="text-orange-700 text-sm">
                    {!account
                        ? "Connecte wallet to write"
                        : isOnWrongNetwork && networkData && `Switch to ${networkData?.name}`}
                </span>
            </div>

            <div className="w-full mt-4">
                {writeOnlyFunctionFragments.map((func, index) => {
                    return (
                        <WriteMethod
                            key={`${func.name}-${index}`}
                            fragment={func}
                            contractInstance={contractInstance}
                            errorDecoder={errorDecoder}
                            confidenceScores={getFragmentConfidenceScore(ABIConfidenceScores, func)}
                            disable={isOnWrongNetwork}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const WriteMethod: React.FC<{
    fragment: JsonFragment;
    confidenceScores?: number;
    contractInstance: Contract | null;
    errorDecoder: ErrorDecoder;
    disable: boolean;
}> = ({ fragment, contractInstance, errorDecoder, confidenceScores, disable }) => {
    const name = fragment.name;
    const inputs = fragment.inputs || [];
    const [result, setResult] = useState<ContractMethodResult>();
    const [isLoading, setIsLoading] = useState(false);

    const { address } = useAppKitAccount();

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

            const res = await contractInstance[`${getFunctionSignatureFromFragment(fragment)}`](..._args);

            return res;
        },
        [contractInstance]
    );

    const onFormSubmit: SubmitHandler<ContractMethodFormFields> = useCallback(
        async (formData) => {
            try {
                if (!address) return setResult({ result: null, error: "Kindly connect a wallet to write" });
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
        [address, callFunction, errorDecoder, fragment]
    );

    const handleFormChange = useCallback(() => {
        result && setResult(undefined);
    }, [result]);
    const { chainId } = useAppKitNetwork();

    const networkData = useNetworkDataForChainId(chainId ? Number(chainId) : undefined);
    const getTransactionLink = (txHash: string) => {
        if (networkData && networkData.explorers[0].url) {
            return `${networkData.explorers[0].url}/tx/${txHash}`;
        }
    };

    return (
        <Disclosure as="div" className="w-full mt-4 rounded-md border-2 border-gray-200">
            <DisclosureButton as="div" className="w-full flex items-center justify-between bg-gray-200 p-2">
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
                        <Icon icon={open ? "mdi-light:chevron-down" : "material-symbols-light:chevron-right"} />
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
                            <div>
                                <button
                                    className="mt-2 py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    type="submit"
                                    disabled={disable}
                                >
                                    Write
                                </button>
                                {result?.result?.hash && getTransactionLink(result?.result?.hash) && (
                                    <a
                                        className="ml-4 mt-2 py-1 px-3 text-sm rounded-md bg-cyan-500 hover:bg-cyan-700 text-gray-50"
                                        href={getTransactionLink(result?.result?.hash)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View on Explorer
                                    </a>
                                )}
                            </div>

                            {isLoading ? (
                                <p className="p-2">fetching...</p>
                            ) : result && result?.error !== null ? (
                                <p className="p-2 text-red-600">{result.error}</p>
                            ) : null}
                        </form>
                    </FormProvider>
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
};

export default WriteContractFunctions;
