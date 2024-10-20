"use client";

import { FragmentStateMutability, FragmentType } from "@/constant/fragment";
import { useContract } from "@/hooks/useContract";
import { escapeRegExp, numberInputRegex } from "@/utils/regex";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Fragment, useState } from "react";
import { DecodedError, ErrorDecoder } from "ethers-decode-error";
import { Contract, JsonFragment } from "ethers";
import { Result } from "ethers";
import useErrorDecoder from "@/hooks/useErrorDecoder";

type Props = {
    address: string | null;
    ABI?: string;
    startBlock?: number;
};

const ReadContractFunctions: React.FC<Props> = ({ address, ABI, startBlock }) => {
    const [blockNumber, setBlockNumber] = useState<number | null>(null);

    const parsedABI = JSON.parse(ABI ?? "[]");

    const readOnlyFunctionFragments: ReadonlyArray<JsonFragment> = parsedABI.filter(
        (fragment: JsonFragment) =>
            (fragment.stateMutability === FragmentStateMutability.VIEW ||
                fragment.stateMutability === FragmentStateMutability.PURE) &&
            fragment.type === FragmentType.FUNCTION
    );
    const contractInstance = useContract(address as string, parsedABI, false);

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
                {readOnlyFunctionFragments.map((func: JsonFragment) => {
                    return (
                        <ReadMethod
                            key={func.name}
                            fragment={func}
                            contractInstance={contractInstance}
                            blockNumber={blockNumber}
                            errorDecoder={errorDecoder}
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
    blockNumber: number | null;
    errorDecoder: ErrorDecoder;
}> = ({ fragment, contractInstance, blockNumber, errorDecoder }) => {
    const name = fragment.name;
    const inputs = fragment.inputs || [];
    const [args, setArgs] = useState<(string | undefined)[]>(Array(inputs.length).fill(undefined));
    const [response, setResponse] = useState<{
        error: string | null;
        result: Result | null;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = async () => {
        if (!contractInstance) return console.error("Contract instance not found");
        try {
            if (args.some((item) => item === undefined)) {
                console.log("Missing args");
                return;
            }

            setLoading(true);

            // come back later to fix this
            const res = await contractInstance[name!](...args, {
                blockTag: blockNumber ?? "latest",
            });

            setResponse({ result: res, error: null });
        } catch (error: any) {
            console.error("error: ", JSON.stringify(error, null, 2));
            const decodedError: DecodedError = await errorDecoder.decode(error);
            setResponse({ result: null, error: decodedError.reason || "Unknow error" });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Disclosure as="div" className="w-full mt-4 rounded-md border-2 border-gray-200">
            <DisclosureButton
                as="div"
                className="w-full flex items-center justify-between bg-gray-200 p-2"
                onClick={() => {
                    if (args.length === 0) {
                        execute();
                    }
                }}
            >
                {({ open }) => (
                    <Fragment>
                        <span>{name}</span>
                        {args.length === 0 ? (
                            <button
                                className="mt-2 py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50"
                                onClick={(e) => {
                                    if (open) {
                                        e.stopPropagation();
                                    }
                                    execute();
                                }}
                            >
                                Query
                            </button>
                        ) : (
                            <ArrowRightIcon width={16} />
                        )}
                    </Fragment>
                )}
            </DisclosureButton>
            <DisclosurePanel className="">
                <div className="p-2 overflow-auto">
                    {inputs.map((input, i) => (
                        <div key={`${input.name}-${i}`} className="space-y-2">
                            <div>
                                {input.name || "<input>"} ({input.type})
                            </div>
                            <input
                                name={`${name}-${input.name}-${i}`}
                                type="text"
                                className="w-full p-2 rounded-md border bg-transparent border-gray-400 focus:border-gray-600 outline-none text-sm"
                                value={args[i]}
                                placeholder={`${input.name} (${input.type})`}
                                onChange={(e) => {
                                    setArgs((oldArgs) => {
                                        let newArgs = [...oldArgs];
                                        newArgs[i] = e.target.value;
                                        return newArgs;
                                    });
                                }}
                            />
                        </div>
                    ))}
                    {args.length > 0 && (
                        <button
                            className="mt-2 py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50"
                            onClick={() => {
                                execute();
                            }}
                        >
                            Query
                        </button>
                    )}

                    {loading ? (
                        <p className="p-2">fetching...</p>
                    ) : response && response.result !== null ? (
                        <p className="p-2">{String(response?.result)}</p>
                    ) : response?.error ? (
                        <p className="p-2 text-red-600">{response.error}</p>
                    ) : null}
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
};

export default ReadContractFunctions;
