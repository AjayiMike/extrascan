"use client";
import Connection from "@/components/connection";
import ContractDetails from "@/views/ContractDetails";
import ContractExplorer from "@/views/ContractExplorer";
import { Fragment, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CodeDataType } from "@/types/core";
import { useSearchParams, useRouter } from "next/navigation";
import { isSupportedNetwork } from "@/config/network";
import { isAddress } from "@/utils/address";
import LoadingView from "@/views/LoadingView";

enum PARAMS_KEY {
    ADDRESS = "address",
    NETWORK_ID = "networkId",
}

export default function Home() {
    const [contractData, setContractData] = useState<CodeDataType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const address = searchParams.get("address");
    const networkId = searchParams.get("networkId");

    const handleChangeChange = (key: PARAMS_KEY, value: string) => {
        const url = new URL(document.location.href);
        url.searchParams.set(key, value);
        router.push(url.toString());
    };

    const handleSubmit = async () => {
        try {
            if (!address || !networkId) return;
            setIsLoading(true);
            const response = await fetch("/api/code/", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    networkId,
                    address,
                }),
            });

            const data = (await response.json()) as CodeDataType;

            const isVerified = data.isVerified;
            if (isVerified) {
                setContractData(data);
                return;
            }

            console.log("seems we have an unverified contract here, trying to extrapolate...");

            const extrapolateABIresponse = await fetch("/api/extrapolate-abi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    networkId,
                    address,
                    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
                }),
            });

            const extrapolateABIdata = await extrapolateABIresponse.json();

            if (!extrapolateABIdata.ABI) throw `unable to extrapolate ABI for unverified contract: ${address}`;
            setContractData(extrapolateABIdata);
        } catch (error: any) {
            console.error("error: ", error);
            toast.error(error?.message ?? "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const isValidNetworkId = networkId && isSupportedNetwork(networkId);
        const isValidAddress = address && isAddress(address);
        if (isValidNetworkId || isValidAddress) {
            handleSubmit();
        }
    }, [networkId, address]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
                <LoadingView />
            ) : (
                <Fragment>
                    <ContractDetails
                        address={address ?? undefined}
                        networkId={networkId ?? undefined}
                        handleAddressChange={(value) => handleChangeChange(PARAMS_KEY.ADDRESS, value)}
                        handleNetWorkIdChange={(value) => handleChangeChange(PARAMS_KEY.NETWORK_ID, value)}
                    />
                    {contractData && <ContractExplorer data={contractData as CodeDataType} />}
                </Fragment>
            )}
        </div>
    );
}
