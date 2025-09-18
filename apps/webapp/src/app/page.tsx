"use client";

import ContractDetails from "@/components/ContractDetails";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CodeDataType } from "@extrascan/shared/types";
import { isSupportedNetwork } from "@extrascan/shared/configs";
import { isAddress } from "@extrascan/shared/utils";
import clsx from "clsx";
import { useQueryState } from "nuqs";
import { getStoredApiKeys } from "@extrascan/shared/utils";
import { ModelProvider } from "@extrascan/shared/types";
import UniversalDApp from "@/components/UniversalDApp";
import { useAppKitAccount } from "@reown/appkit/react";

export default function Home() {
    const [contractData, setContractData] = useState<CodeDataType | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isExtrapolating, setIsExtrapolating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { address: userAddress } = useAppKitAccount();

    const [_networkId, setNetworkId] = useQueryState("networkId");
    const [address, setAddress] = useQueryState("address");

    const networkId = useMemo(() => Number(_networkId), [_networkId]);

    const handleSubmit = useCallback(
        async (signal?: AbortSignal) => {
            try {
                if (!networkId || !isAddress(address)) return;
                setContractData(null);
                setIsFetching(true);
                setError(null);
                const response = await fetch("/api/code/", {
                    method: "POST",
                    signal,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        networkId: Number(networkId),
                        address,
                    }),
                });

                const data = (await response.json()) as CodeDataType;

                if (data.isVerified) {
                    setContractData({ ...data, networkId: Number(networkId) });
                    return;
                }

                if (!data.bytecode) {
                    setError("Could not fetch contract bytecode. Please provide a valid contract address.");
                    return;
                }

                const apiKeys = getStoredApiKeys();
                const hasValidApiKey = Object.values(ModelProvider).some((provider) => apiKeys[provider]);

                if (!hasValidApiKey) {
                    setError(
                        "Contract is not verified. Please provide at least one AI model API key in settings to extrapolate the ABI."
                    );
                    return;
                }

                console.debug("extrapolating ABI...");
                setIsExtrapolating(true);

                const extrapolateABIresponse = await fetch("/api/extrapolate-abi", {
                    method: "POST",
                    signal,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        bytecode: data.bytecode,
                        apiKeys,
                        preferredProvider: localStorage.getItem("preferred_provider") || undefined,
                    }),
                });

                const extrapolateABIdata = await extrapolateABIresponse.json();

                if (!extrapolateABIdata.ABI)
                    throw new Error(
                        extrapolateABIdata.error || `unable to extrapolate ABI for unverified contract: ${address}`
                    );
                setContractData({ ...extrapolateABIdata, address, networkId: Number(networkId) });
            } catch (error: any) {
                if (error.name === "AbortError") {
                    console.debug("Fetch request was canceled");
                } else {
                    console.debug("error: ", error);
                    setError(JSON.stringify(error?.message) ?? "Something went wrong");
                }
            } finally {
                setIsFetching(false);
                if (isExtrapolating) setIsExtrapolating(false);
            }
        },
        [address, isExtrapolating, networkId]
    );

    useEffect(() => {
        if (isFetching) return;
        const isValidNetworkId = networkId && isSupportedNetwork(Number(networkId));
        const isValidAddress = address && isAddress(address);
        if (!isValidNetworkId || !isValidAddress) return;
        const abortController = new AbortController();
        const { signal } = abortController;

        handleSubmit(signal);

        return () => {
            abortController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkId, address]);

    return (
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <section className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Extrascan - Smart Contract ABI Extrapolator</h1>
                <p className="text-gray-500">
                    A powerful tool to interact with smart contracts and extract their ABI. Works with both verified and
                    unverified contracts across multiple blockchain networks.
                </p>
            </section>
            <section aria-label="Contract Input Form">
                <ContractDetails
                    address={address ?? ""}
                    networkId={networkId ?? undefined}
                    handleAddressChange={(value) => setAddress(value)}
                    handleNetworkIdChange={(value) => setNetworkId(value)}
                />
            </section>
            <section aria-label="Contract Results" className="mt-6">
                {isFetching ? (
                    <div className="flex gap-4 items-center" role="status" aria-label="Loading">
                        <div className="loader-cube" />
                        <div className={clsx({ "loader-text": true, extrapolating: isExtrapolating })}></div>
                    </div>
                ) : contractData ? (
                    <UniversalDApp data={contractData as CodeDataType} />
                ) : (
                    error && (
                        <div className="mt-2" role="alert">
                            <div className="flex gap-4 items-center">
                                <h2 className="font-bold text-2xl">Error</h2>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <p className="text-red-400 text-base">{error}</p>
                        </div>
                    )
                )}
            </section>
        </article>
    );
}
