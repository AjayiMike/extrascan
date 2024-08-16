"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useSDK } from "@metamask/sdk-react";
import React, { Fragment, useCallback } from "react";
import { ChevronDownIcon, PencilSquareIcon, ClipboardIcon } from "@heroicons/react/24/solid";
import { shortenAddress } from "@/utils/address";
import { formatEther } from "ethers";
import { formatLargeValue } from "@/utils/value";

type Props = {};

const Connection = (props: Props) => {
    const { sdk, chainId, account, balance } = useSDK();
    const handleConnect = useCallback(async () => {
        try {
            await sdk?.connect();
        } catch (err) {
            console.warn(`failed to connect..`, err);
        }
    }, [sdk]);
    return (
        <div>
            <Menu as="div" className="w-96 max-w-full bg-gray-200 rounded-md p-2 relative mb-1">
                <MenuButton className="w-full px-2 text-left cursor-pointer flex items-center justify-between">
                    <span className="">{!!account ? "Injected Provider - Metamask" : "No Connection"}</span>
                    <ChevronDownIcon width={16} />
                </MenuButton>
                <MenuItems className="origin-bottom-left text-left w-full py-4 bg-gray-200 rounded-sm p-2 absolute left-0">
                    <MenuItem
                        as="button"
                        className="block w-full p-2 text-left hover:bg-gray-300"
                        onClick={handleConnect}
                    >
                        <span>Injected Provider - Metamask</span>
                    </MenuItem>
                </MenuItems>
            </Menu>
            {!!account && !!chainId && (
                <Fragment>
                    <span className="bg-gray-300 border border-gray-400 rounded-md p-1 text-xs inline-flex gap-2">
                        <span className="">Network ID:</span>
                        <span className="text-cyan-800">{Number(chainId)}</span>
                    </span>

                    <div className="mt-4">
                        <div className="flex gap-2">
                            <span className="">Account</span>
                            <PencilSquareIcon width={16} />
                            <ClipboardIcon width={16} />
                        </div>
                        <div className="bg-gray-300 border border-gray-400 w-60 p-2 flex gap-2">
                            <span>{shortenAddress(account)}</span>
                            {!!balance && (
                                <span>({formatLargeValue(Number(formatEther(balance.toString())), false)} Ether)</span>
                            )}
                        </div>
                    </div>
                </Fragment>
            )}
        </div>
    );
};

export default Connection;
