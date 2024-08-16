"use client";
import { shortenAddress } from "@/utils/address";
import { escapeRegExp, numberInputRegex } from "@/utils/regex";
import { FormatTypes } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Result } from "ethers";
import { JsonFragment } from "ethers";
import React, { useState } from "react";
import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
} from "@headlessui/react";
import { useContract } from "@/hooks/useContract";
import { ErrorDescription } from "ethers";

type Props = {
    address: string;
    abi: ReadonlyArray<JsonFragment>;
    contractName?: string;
    deployer?: string;
    startBlock?: number;
};
const ContractExplorer: React.FC<Props> = ({ abi, address, contractName, deployer, startBlock }) => {
    return (
        <div className="w-full">
            <div className="flex gap-8">
                <div className="flex gap-4">
                    <span>Name:</span>
                    <span className="text-cyan-800">{contractName ?? "Unknown"}</span>
                </div>
                <div className="flex gap-4">
                    <span>deployer:</span>
                    <span className="text-cyan-800">{deployer ? shortenAddress(deployer) : "Unknown"}</span>
                </div>
                <div className="flex gap-4">
                    <span>Start Block:</span>
                    <span className="text-cyan-800">{startBlock ?? "Unknown"}</span>
                </div>
            </div>
            <TabGroup className="w-full mt-6">
                <TabList className="flex gap-4">
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        Read
                    </Tab>
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        Write
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <ReadContractFunctions address={address} abi={abi} startBlock={startBlock} />
                    </TabPanel>
                    <TabPanel>
                        <WriteContractFunctions address={address} abi={abi} />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

const ReadContractFunctions: React.FC<Pick<Props, "address" | "abi" | "startBlock">> = ({
    address,
    abi,
    startBlock,
}) => {
    const [blockNumber, setBlockNumber] = useState<number | null>(null);

    const enforcer = (nextUserInput: string) => {
        if (nextUserInput === "" || numberInputRegex.test(escapeRegExp(nextUserInput))) {
            setBlockNumber(parseInt(nextUserInput));
        }
    };

    const readOnlyFunctionFragments: Props["abi"] = abi.filter(
        (fragment) => fragment.stateMutability === "view" || fragment.stateMutability === "pure"
    );

    const contractInstance = useContract(address, abi, false);

    return (
        <div className="w-full mt-6">
            <details className="w-48">
                <summary className="cursor-pointer selection:bg-transparent">At Block</summary>
                <input
                    type="number"
                    className="w-full p-2 rounded-md border bg-gray-200 outline-none text-sm"
                    placeholder="latest"
                    min={startBlock || 0}
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    onKeyDown={(evt) => ["e", "E", "+", "-", "."].includes(evt.key) && evt.preventDefault()}
                    value={blockNumber || ""}
                    onChange={(event) => {
                        // replace commas with periods, because we exclusively uses period as the decimal separator
                        enforcer(event.target.value.replace(/,/g, "."));
                    }}
                />
            </details>
            <div className="w-full mt-4">
                {readOnlyFunctionFragments.map((func) => {
                    return (
                        <ReadMethods
                            key={func.name}
                            fragment={func}
                            contractInstance={contractInstance}
                            blockNumber={blockNumber}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const ReadMethods: React.FC<{
    fragment: JsonFragment;
    contractInstance: Contract | null;
    blockNumber: number | null;
}> = ({ fragment, contractInstance, blockNumber }) => {
    const name = fragment.name;
    const inputs = fragment.inputs || [];
    const [args, setArgs] = useState<(string | undefined)[]>(Array(inputs.length).fill(undefined));
    const [response, setResponse] = useState<{
        error: string | null;
        result: Result | null;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = async () => {
        try {
            if (args.some((item) => item === undefined)) {
                console.log("Missing args");
                return;
            }

            setLoading(true);
            // come back later to fix this
            console.log("name: ", name, "args: ", args, "contractInstance: ", contractInstance);

            const res = await contractInstance?.functions[name!](...args, {
                blockTag: blockNumber ?? "latest",
            });
            setResponse({ result: res, error: null });
        } catch (error: any) {
            console.log("error: ", error);
            try {
                const errorMesage = contractInstance?.interface.parseError(error.data);

                setResponse({
                    result: null,
                    error: errorMesage?.errorFragment.format(FormatTypes.full) || "Unknow error",
                });
            } catch (error) {
                setResponse({ result: null, error: JSON.stringify(error) });
            }
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
                                className="w-full p-2 rounded-md border bg-gray-200 outline-none text-sm"
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
                    <button
                        className="mt-2 py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50"
                        onClick={() => {
                            execute();
                        }}
                    >
                        Query
                    </button>
                    {loading ? (
                        <p className="p-2">loading...</p>
                    ) : response?.result ? (
                        <p className="p-2">{JSON.stringify(response.result, null, 2)}</p>
                    ) : response?.error ? (
                        <p className="p-2 text-red-600">{response.error}</p>
                    ) : null}
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
};

const WriteContractFunctions: React.FC<Pick<Props, "address" | "abi">> = ({ address, abi }) => {
    return <div>Write functions</div>;
};

export default ContractExplorer;
