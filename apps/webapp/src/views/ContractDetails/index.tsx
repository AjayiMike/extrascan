import { NetworkSelector } from "@extrascan/shared/components";
import { Icon } from "@iconify/react";

interface Props {
    address: string | undefined;
    networkId: number | undefined;
    handleAddressChange: (value: string) => void;
    handleNetworkIdChange: (value: string) => void;
    shouldShowRetryButton?: boolean;
    handleRetry?: () => Promise<void>;
}

export default function ContractDetails({
    address,
    networkId,
    handleAddressChange,
    handleNetworkIdChange,
    shouldShowRetryButton,
    handleRetry,
}: Props) {
    return (
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 mb-6 w-full">
            <NetworkSelector networkId={networkId} handleNetworkIdChange={handleNetworkIdChange} />
            <input
                type="text"
                placeholder="Contract Address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value.trim().toLowerCase())}
                className="h-10 block text-sm w-96 max-w-full px-4 py-2 rounded-md bg-[#ccd0d1] outline-none border border-gray-400/50 focus:border-gray-400"
            />
            {shouldShowRetryButton && (
                <button
                    onClick={handleRetry}
                    className="h-10 w-96 max-w-full sm:w-24 flex items-center justify-center gap-2 px-4 py-1 bg-cyan-800 text-white rounded-md hover:bg-cyan-700 transition duration-300"
                >
                    <span>Retry</span>
                    <Icon icon="f7:arrow-2-circlepath-circle" className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
