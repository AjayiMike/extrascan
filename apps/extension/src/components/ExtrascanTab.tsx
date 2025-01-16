import { useEffect, useState } from "react";
import { CodeDataType, ModelProvider } from "@extrascan/shared/types";
import { getStoredApiKeys } from "../utils/storage";
import { UniversalDApp } from "@extrascan/shared/components";

export default function ExtrascanTab() {
    const [isExtrapolating, setIsExtrapolating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contractData, setContractData] = useState<CodeDataType | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const address = window.location.pathname.split("/")[2];
                const codeElement = document.querySelector("#dividcode .wordwrap.scrollbar-custom");
                if (!codeElement) return;

                const bytecode = codeElement.innerHTML.trim();

                // First check if contract is verified
                const response = await fetch("https://www.extrascan.xyz/api/code", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        networkId: 11155111, // Sepolia network ID
                        address,
                    }),
                });

                const data = await response.json();

                if (data.isVerified) {
                    setContractData({ ...data, networkId: 11155111 });
                    return;
                }

                // Get API keys from extension storage
                const apiKeys = await getStoredApiKeys();
                const hasValidApiKey = Object.values(ModelProvider).some((provider) => apiKeys[provider]);

                if (!hasValidApiKey) {
                    setError(
                        "Contract is not verified. Please provide at least one AI model API key in settings to extrapolate the ABI."
                    );
                    return;
                }

                setIsExtrapolating(true);
                console.debug("extrapolating ABI...");

                const extrapolateResponse = await fetch("https://www.extrascan.xyz/api/extrapolate-abi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        networkId: 11155111,
                        address,
                        bytecode,
                        apiKeys,
                        preferredProvider: undefined,
                    }),
                });

                const extrapolateData = await extrapolateResponse.json();

                if (!extrapolateData.ABI) {
                    throw new Error(
                        extrapolateData.error || `unable to extrapolate ABI for unverified contract: ${address}`
                    );
                }

                setContractData({ ...extrapolateData, networkId: 11155111 });
            } catch (error: unknown) {
                console.error("Error:", error);
                setError(error instanceof Error ? error.message : "Something went wrong");
            } finally {
                setIsExtrapolating(false);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Extrascan</h2>
            {isExtrapolating && <div>Extrapolating ABI...</div>}
            {contractData && <UniversalDApp data={contractData} />}
        </div>
    );
}
