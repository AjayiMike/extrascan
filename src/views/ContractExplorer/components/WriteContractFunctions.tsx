"use client";

import { FragmentStateMutability, FragmentType } from "@/constant/fragment";
import { useContract } from "@/hooks/useContract";
import useErrorDecoder from "@/hooks/useErrorDecoder";
import { escapeRegExp, numberInputRegex } from "@/utils/regex";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Contract } from "ethers";
import { JsonFragment } from "ethers";
import { DecodedError, ErrorDecoder } from "ethers-decode-error";
import { useState } from "react";

type Props = {
    address: string;
    abi: ReadonlyArray<JsonFragment>;
};
const WriteContractFunctions: React.FC<Props> = ({ address, abi }) => {
    const writeOnlyFunctionFragments: Props["abi"] = abi.filter(
        (fragment) =>
            (fragment.stateMutability === FragmentStateMutability.PAYABLE ||
                fragment.stateMutability === FragmentStateMutability.NON_PAYABLE) &&
            fragment.type === FragmentType.FUNCTION
    );

    const contractInstance = useContract(address, abi);
    const errorDecoder = useErrorDecoder(contractInstance?.interface);

    return (
        <div className="w-full mt-6">
            <div className="w-full mt-4">
                {writeOnlyFunctionFragments.map((func) => {
                    return (
                        <WriteMethod
                            key={func.name}
                            fragment={func}
                            contractInstance={contractInstance}
                            errorDecoder={errorDecoder}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const WriteMethod: React.FC<{
    fragment: JsonFragment;
    contractInstance: Contract | null;
    errorDecoder: ErrorDecoder;
}> = ({ fragment, contractInstance, errorDecoder }) => {
    const name = fragment.name;
    const inputs = fragment.inputs || [];
    const [args, setArgs] = useState<(string | undefined)[]>(Array(inputs.length).fill(undefined));
    const [nativeTokenWeiValue, setNativeTokenWeiValue] = useState<number | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isPayable = fragment.stateMutability === FragmentStateMutability.PAYABLE;

    const execute = async () => {
        try {
            if (!contractInstance) return console.log("Contract instance not found");
            if (args.some((item) => item === undefined)) {
                console.error("Missing args");
                return;
            }
            setError(null);
            setTxHash(null);
            setLoading(true);
            const tx = await contractInstance[name!](...args, {
                value: isPayable ? BigInt(String(nativeTokenWeiValue) ?? 0) : BigInt(0),
            });
            setTxHash(tx.hash);
            await tx.wait();
        } catch (error: any) {
            console.error("error: ", JSON.stringify(error, null, 2));
            const decodedError: DecodedError = await errorDecoder.decode(error);
            setError(decodedError.reason || "Unknow error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Disclosure as="div" className="w-full mt-4 rounded-md border-2 border-gray-200">
            <DisclosureButton className="w-full flex items-center justify-between bg-gray-200 p-2">
                <span>{name}</span>
                <ArrowRightIcon width={16} />
            </DisclosureButton>
            <DisclosurePanel className="">
                <div className="p-2">
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

                    {isPayable && (
                        <div className="w-full flex gap-4 items-center rounded-md border border-gray-400 focus-within:border-gray-600">
                            <span className="text-sm whitespace-nowrap font-medium text-gray-700 text-nowrap px-4">
                                Send Native Token
                            </span>
                            <input
                                type="number"
                                className="w-full p-2 outline-none text-sm px-3 py-2 rounded-r-md bg-gray-700/20"
                                placeholder="uint256"
                                min={0}
                                pattern="^[0-9]*[.,]?[0-9]*$"
                                onKeyDown={(evt) => ["e", "E", "+", "-", "."].includes(evt.key) && evt.preventDefault()}
                                value={nativeTokenWeiValue || ""}
                                onChange={(event) => {
                                    const nextUserInput = event.target.value.replace(/,/g, ".");
                                    if (nextUserInput === "" || numberInputRegex.test(escapeRegExp(nextUserInput))) {
                                        setNativeTokenWeiValue(
                                            !Number.isNaN(parseInt(nextUserInput)) ? parseInt(nextUserInput) : null
                                        );
                                    }
                                }}
                            />
                        </div>
                    )}
                    <div>
                        <button
                            className="mt-2 py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50"
                            onClick={() => {
                                execute();
                            }}
                        >
                            Write
                        </button>
                        {txHash && (
                            <a
                                className="ml-4 mt-2 py-1 px-3 text-sm rounded-md bg-cyan-500 hover:bg-cyan-700 text-gray-50"
                                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View on Explorer
                            </a>
                        )}
                    </div>

                    {loading && !txHash ? (
                        <p className="p-2">Approve in wallet...</p>
                    ) : (
                        error && <p className="p-2 text-red-600">{error}</p>
                    )}
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
};

export default WriteContractFunctions;
