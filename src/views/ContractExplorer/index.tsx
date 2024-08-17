"use client";
import { shortenAddress } from "@/utils/address";
import { JsonFragment } from "ethers";
import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import ReadContractFunctions from "./components/ReadContractFunctions";
import WriteContractFunctions from "./components/WriteContractFunctions";

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
                <TabList className="flex gap-4 border-b-2 border-gray-300">
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b-2 data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
                        Read
                    </Tab>
                    <Tab className="pr-4 font-semibold text-gray-700 focus:outline-none data-[selected]:border-b-2 data-[selected]:border-gray-700 data-[focus]:outline-1 data-[focus]:outline-gray-700">
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

export default ContractExplorer;
