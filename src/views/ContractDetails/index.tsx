import NetworkSelector from "@/components/networkSelector";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

interface Props {
    address: string | undefined;
    networkId: string | undefined;
    handleAddressChange: (value: string) => void;
    handleNetWorkIdChange: (value: string) => void;
    shouldShowRetryButton?: boolean;
    handleRetry?: () => Promise<void>;
}

export default function ContractDetails({
    address,
    networkId,
    handleAddressChange,
    handleNetWorkIdChange,
    shouldShowRetryButton,
    handleRetry,
}: Props) {
    return (
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 mb-6 w-full">
            <NetworkSelector networkId={networkId} handleNetWorkIdChange={handleNetWorkIdChange} />
            <input
                type="text"
                placeholder="Contract Address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="h-10 block text-sm w-96 max-w-full px-4 py-2 rounded-md bg-gray-200 outline-none border border-gray-400/50 focus:border-gray-400"
            />
            {shouldShowRetryButton && (
                <button
                    onClick={handleRetry}
                    className="h-10 w-96 max-w-full sm:w-24 flex items-center justify-center gap-2 px-4 py-1 bg-cyan-800 text-white rounded-md hover:bg-cyan-700 transition duration-300"
                >
                    <span>Retry</span>
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
