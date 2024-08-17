"use client";
import Connection from "@/components/connection";
import ContractDetails from "@/views/ContractDetails";
import ContractExplorer from "@/views/ContractExplorer";
import { useQueryState } from "nuqs";
import { useState } from "react";
// import WETH_ABI from "@/constant/abi/WETH.json";
import universalRouter from "@/constant/abi/UniswapUniversalRouter.json";

enum VIEW {
    CONTRACT_DETAILS,
    CONTRACT_EXPLORER,
}

export default function Home() {
    const [view, setView] = useState(VIEW.CONTRACT_EXPLORER);
    const [hasByteCode, setHasByteCode] = useState<boolean>(false);
    const [address, setAddress] = useQueryState("address");
    const [bytecode, setBytecode] = useQueryState("bytecode");

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <ContractExplorer address={address ?? ""} abi={universalRouter} />
                )}
            </div>
        </div>
    );
}
