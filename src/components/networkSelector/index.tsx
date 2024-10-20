import { getNetworkIcon, getNetworkName, supportedNetworks } from "@/config/network";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import React, { Fragment } from "react";

type Props = {
    networkId: string | undefined;
    handleNetWorkIdChange: (value: string) => void;
};

const NetworkSelector: React.FC<Props> = ({ networkId, handleNetWorkIdChange }) => {
    const [networkModalIsOpen, setNetworkModalIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const filteredNetworks = React.useMemo(() => {
        if (!searchTerm) return supportedNetworks;
        return supportedNetworks.filter(
            (network) =>
                network.name.toLowerCase().includes(searchTerm.toLowerCase()) || network.id === Number(searchTerm)
        );
    }, [searchTerm]);

    const handleNetworkButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setNetworkModalIsOpen(true);
    };

    return (
        <div className="relative w-96 max-w-full text-sm">
            <button
                type="button"
                onClick={handleNetworkButtonClick}
                className="h-10 w-full flex justify-between items-center cursor-pointer bg-white hover:bg-gray-300 px-4 py-2 rounded-md hover:bg-white/25 transition duration-300"
            >
                <div className="flex items-center gap-2">
                    {networkId && <img src={getNetworkIcon(networkId)} alt="network icon" className="h-6 w-6" />}
                    <input
                        readOnly
                        className="text-left outline-none bg-transparent"
                        value={networkId ? getNetworkName(networkId) : "Select Network"}
                    />
                </div>
                <ChevronDownIcon className="group pointer-events-none size-4 fill-black/60" aria-hidden="true" />
            </button>

            <Transition appear show={networkModalIsOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setNetworkModalIsOpen(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Select Network
                                    </DialogTitle>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Please select the network you want to use.
                                        </p>
                                    </div>

                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            placeholder="Search network"
                                            className="w-full px-3 py-2 rounded-md border bg-gray-200 outline-none"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <div className="mt-2 max-h-60 overflow-y-auto">
                                            {filteredNetworks.map((network) => (
                                                <div
                                                    key={network.id}
                                                    className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleNetWorkIdChange(String(network.id));
                                                        setNetworkModalIsOpen(false);
                                                    }}
                                                >
                                                    {network.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default NetworkSelector;
