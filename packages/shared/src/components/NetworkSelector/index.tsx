"use client";
import { getNetworkIcon, getNetworkName } from "@/configs/network";
import { useSupportedNetworkData } from "@/hooks/useSupportedNetworkData";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Icon } from "@iconify/react";
import React, { Fragment, useEffect } from "react";
import "../../styles/globals.css";

export type NetworkSelectorProps = {
    networkId: number | undefined;
    handleNetworkIdChange: (value: string) => void;
};

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({ networkId, handleNetworkIdChange }) => {
    const [networkModalIsOpen, setNetworkModalIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const networkData = useSupportedNetworkData();

    const [networkIcon, setNetworkIcon] = React.useState<string | null>(null);
    const [networkName, setNetworkName] = React.useState<string | null>(null);
    useEffect(() => {
        if (networkId) {
            Promise.all([getNetworkIcon(networkId), getNetworkName(networkId)])
                .then(([icon, name]) => {
                    setNetworkIcon(icon);
                    setNetworkName(name);
                })
                .catch(() => {
                    setNetworkIcon(null);
                    setNetworkName(null);
                });
        } else {
            setNetworkIcon(null);
            setNetworkName(null);
        }
    }, [networkId]);

    const filteredNetworks = React.useMemo(() => {
        if (!searchTerm) return networkData;
        return networkData.filter(
            (network) =>
                network.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                network.chainId.toString().includes(searchTerm)
        );
    }, [networkData, searchTerm]);

    const handleNetworkButtonClick = () => {
        setNetworkModalIsOpen(true);
    };

    return (
        <div className="relative w-96 max-w-full text-sm">
            <button
                type="button"
                onClick={handleNetworkButtonClick}
                className="h-10 w-full flex justify-between items-center cursor-pointer bg-white/50 hover:bg-[#ccd0d1] px-4 py-2 rounded-md hover:bg-white/25 transition duration-300"
            >
                <div className="flex items-center gap-2">
                    {networkIcon ? (
                        <img src={networkIcon ?? ""} alt="network icon" className="w-6 h-6" />
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path
                                fillRule="evenodd"
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.44-2.7a.94.94 0 00-1.11-.28l-3.26-3.36a.94.94 0 00-1.08.05L8.47 11.3a.94.94 0 00.28 1.08l3.26 3.36a.94.94 0 00.99-.17.94.94 0 00.09-1.11z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                    <input
                        readOnly
                        className="text-left outline-none bg-transparent"
                        value={networkName ?? "Select Network"}
                    />
                </div>
                <Icon icon="mdi-light:chevron-down" />
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
                                                    key={network.chainId}
                                                    className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleNetworkIdChange(String(network.chainId));
                                                        setNetworkModalIsOpen(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {network.iconUrl ? (
                                                            <img
                                                                src={network.iconUrl}
                                                                alt="network icon"
                                                                className="h-6 w-6"
                                                            />
                                                        ) : (
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                width="24"
                                                                height="24"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.44-2.7a.94.94 0 00-1.11-.28l-3.26-3.36a.94.94 0 00-1.08.05L8.47 11.3a.94.94 0 00.28 1.08l3.26 3.36a.94.94 0 00.99-.17.94.94 0 00.09-1.11z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        )}
                                                        <span>{network.name}</span>
                                                    </div>
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
