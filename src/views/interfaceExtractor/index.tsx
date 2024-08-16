"use client";
import React, { useCallback, useState } from "react";
import ContractDetails from "./components/contractDetails";
import Connection from "@/components/connection";
import { useQueryState } from "nuqs";
import erc20abi from "@/constant/abi/erc20.json";
import ContractExplorer from "./components/contractExplorer";

type Props = {};

enum VIEW {
    CONTRACT_DETAILS,
    CONTRACT_EXPLORER,
}

const InterfaceExtractor = (props: Props) => {
    const [view, setView] = useState(VIEW.CONTRACT_EXPLORER);
    const [hasByteCode, setHasByteCode] = useState<boolean>(false);
    const [address, setAddress] = useQueryState("address");
    const [bytecode, setBytecode] = useQueryState("bytecode");

    const handleExtractABI = useCallback(() => {}, []);
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Connection />
            <div className="mt-6">
                {view === VIEW.CONTRACT_DETAILS ? (
                    <ContractDetails
                        address={address ?? ""}
                        hasByteCode={hasByteCode}
                        byteCode={bytecode ?? ""}
                        handleAddressChange={setAddress}
                        handleHasByteCodeChange={setHasByteCode}
                        handleByteCodeChange={setBytecode}
                    />
                ) : (
                    <ContractExplorer address={address ?? ""} abi={erc20abi} />
                )}
            </div>
        </div>
    );
};

export default InterfaceExtractor;
