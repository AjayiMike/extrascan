"use client";
import { shortenAddress } from "../../utils";
import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ReadContractFunctions } from "./components/ReadContractFunctions";
import { WriteContractFunctions } from "./components/WriteContractFunctions";
import { ABIComponent } from "./components/ABI";
import type { CodeDataType } from "../../types";
import { Icon } from "@iconify/react";

export { ReadContractFunctions } from "./components/ReadContractFunctions";
export { WriteContractFunctions } from "./components/WriteContractFunctions";
export { ABIComponent } from "./components/ABI";

type Props = {
    data: CodeDataType;
};

const UniversalDApp: React.FC<Props> = ({
    data: {
        ABI,
        ABIConfidenceScores,
        address,
        networkId,
        contractName,
        bytecode,
        sourceCode,
        isVerified,
        startBlock,
        deployer,
    },
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
                            <span className="flex gap-1 items-center">
                                <Icon icon="ic:outline-check-circle" className="h-5 w-5 text-green-500" />
                                <span>Yes</span>
                            </span>
                        ) : (
                            <span className="flex gap-1 items-center">
                                <Icon icon="lucide:circle-x" className="h-5 w-5 text-red-500" />
                                <span>No</span>
                            </span>
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
            {!isVerified && (
                <p className="mt-4 text-sm text-gray-500">
                    The ABI of this smart contract was extrapolated from the bytecode, as such, some functions may not
                    be present or accurately extrapolated. Associated with each function is a confidence score (from 0 -
                    1), which indicates the likelihood of the function being accurate.
                </p>
            )}
            <TabGroup className="w-full mt-4">
                <TabList className="flex gap-4 border-b-2 border-gray-300">
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b-2 data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        Read
                    </Tab>
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b-2 data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        Write
                    </Tab>
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b-2 data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        ABI
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <ReadContractFunctions
                            networkId={networkId}
                            address={address}
                            ABI={ABI}
                            ABIConfidenceScores={ABIConfidenceScores}
                            startBlock={startBlock}
                        />
                    </TabPanel>
                    <TabPanel>
                        <WriteContractFunctions
                            networkId={networkId}
                            address={address}
                            ABI={ABI}
                            ABIConfidenceScores={ABIConfidenceScores}
                        />
                    </TabPanel>
                    <TabPanel>
                        <ABIComponent
                            ABI={ABI}
                            bytecode={bytecode}
                            sourceCode={sourceCode}
                            isExtrapolated={!isVerified}
                        />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

export default UniversalDApp;
