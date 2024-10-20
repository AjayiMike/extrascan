"use client";
import { shortenAddress } from "@/utils/address";
import { JsonFragment } from "ethers";
import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import ReadContractFunctions from "./components/ReadContractFunctions";
import WriteContractFunctions from "./components/WriteContractFunctions";
import Code from "./components/Code";
import { CodeDataType } from "@/types/core";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

type Props = {
    data: CodeDataType;
};
const ContractExplorer: React.FC<Props> = ({
    data: { ABI, address, contractName, bytecode, sourceCode, isVerified, startBlock, deployer },
}) => {
    return (
        <div className="w-full">
            <div className="flex gap-x-8 gap-y-2 flex-wrap">
                <div className="flex gap-4">
                    <span>Name:</span>
                    <span className="text-cyan-800">{contractName ?? "Unknown"}</span>
                </div>
                <div className="flex gap-4">
                    <span>Verified:</span>
                    <span className="text-cyan-800 flex items-center gap-1">
                        {isVerified ? (
                            <>
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                Yes
                            </>
                        ) : (
                            <>
                                <XCircleIcon className="h-5 w-5 text-red-500" />
                                No
                            </>
                        )}
                    </span>
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
                <TabList className="flex gap-4 border-b-2 border-gray-300">
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b-2 data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        Read
                    </Tab>
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b-2 data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        Write
                    </Tab>
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b-2 data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        Code
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <ReadContractFunctions address={address} ABI={ABI} />
                    </TabPanel>
                    <TabPanel>
                        <WriteContractFunctions address={address} ABI={ABI} />
                    </TabPanel>
                    <TabPanel>
                        <Code ABI={ABI} bytecode={bytecode} sourceCode={sourceCode} isExtrapolated={!isVerified} />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

export default ContractExplorer;
