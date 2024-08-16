"use client";
import { useState } from "react";

interface Props {
    address: string;
    hasByteCode: boolean;
    byteCode: string;
    handleHasByteCodeChange: (value: boolean) => void;
    handleByteCodeChange: (value: string) => void;
    handleAddressChange: (value: string) => void;
}

export default function ContractDetails({
    address,
    hasByteCode,
    byteCode,
    handleHasByteCodeChange,
    handleByteCodeChange,
    handleAddressChange,
}: Props) {
    return (
        <div className="rounded-lg w-full mt-6">
            <form>
                <div className="mb-4 w-full flex gap-4 items-center border rounded-md border-gray-500">
                    <label className="font-medium text-gray-700 mb-1 text-nowrap px-6">At address</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-r-md bg-gray-200 outline-none"
                    />
                </div>
                <div className="mb-4">
                    <div className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            id="hasByteCode"
                            checked={hasByteCode}
                            onChange={() => handleHasByteCodeChange(!hasByteCode)}
                            className="mr-2"
                        />
                        <label htmlFor="hasByteCode" className="text-sm text-gray-700">
                            Do you have the contract's bytecode?
                        </label>
                    </div>
                </div>
                {hasByteCode && (
                    <div className="mb-4 w-full">
                        <label className="block font-medium text-gray-700 mb-2">Bytecode</label>
                        <textarea
                            placeholder="0x..."
                            value={byteCode}
                            onChange={(e) => handleByteCodeChange(e.target.value)}
                            className="w-full h-56 p-4 rounded-md bg-gray-200 outline-none "
                        />
                    </div>
                )}
                <button
                    type="submit"
                    className="w-full bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-300"
                >
                    Proceed
                </button>
            </form>
        </div>
    );
}
