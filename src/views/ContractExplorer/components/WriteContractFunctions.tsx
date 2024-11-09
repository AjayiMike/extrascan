"use client";

import { FragmentStateMutability, FragmentType } from "@/constant/fragment";
import { useContract } from "@/hooks/useContract";
import useErrorDecoder from "@/hooks/useErrorDecoder";
import { useNetworkDataForChainId } from "@/hooks/useSupportedNetworkData";
import { getFragmentConfidenceScore } from "@/utils/confidenceScore";
import { escapeRegExp, numberInputRegex } from "@/utils/regex";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { Contract } from "ethers";
import { JsonFragment } from "ethers";
import { DecodedError, ErrorDecoder } from "ethers-decode-error";
import { useState } from "react";

type Props = {
    networkId: number;
    address: string | null;
    ABI?: string;
    ABIConfidenceScores?: { [key: string]: number };
};
const WriteContractFunctions: React.FC<Props> = ({ networkId, address, ABI, ABIConfidenceScores }) => {
    const parsedABI = JSON.parse(ABI ?? "[]");
    const writeOnlyFunctionFragments: ReadonlyArray<JsonFragment> = parsedABI.filter(
        (fragment: JsonFragment) =>
            (fragment.stateMutability === FragmentStateMutability.PAYABLE ||
                fragment.stateMutability === FragmentStateMutability.NON_PAYABLE) &&
            fragment.type === FragmentType.FUNCTION
    );
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
    const [args, setArgs] = useState<(string | undefined)[]>(Array(inputs.length).fill(undefined));
    const [nativeTokenWeiValue, setNativeTokenWeiValue] = useState<number | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isPayable = fragment.stateMutability === FragmentStateMutability.PAYABLE;

    const execute = async () => {
        if (disable) return;
        try {
            if (!contractInstance) return console.debug("Contract instance not found");
            if (args.some((item) => item === undefined)) {
                console.debug("Missing args");
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
            console.debug("error: ", JSON.stringify(error, null, 2));
            const decodedError: DecodedError = await errorDecoder.decode(error);
            setError(decodedError.reason || "Unknow error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Disclosure as="div" className="w-full mt-4 rounded-md border-2 border-gray-200">
            <DisclosureButton as="div" className="w-full flex items-center justify-between bg-gray-200 p-2">
                <span>
                    <span>{name}</span>
                    {confidenceScores && (
                        <span className="text-[10px] text-gray-200 ml-2 bg-cyan-800/50 rounded-full px-[6px] py-[2px]">
                            {confidenceScores}
                        </span>
                    )}
                </span>
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
                        <div className="mt-4 w-full flex gap-4 items-center rounded-md border border-gray-400 focus-within:border-gray-600">
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
                            className="mt-2 py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                            onClick={() => {
                                execute();
                            }}
                            disabled={disable}
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
