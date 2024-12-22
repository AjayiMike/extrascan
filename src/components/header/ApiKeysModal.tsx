import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { Fragment, useEffect, useState } from "react";
import { API_KEYS_LOCALSTORAGE_KEY, validateApiKey } from "@/utils/apiKeys";

type ApiKeys = {
    gemini?: string;
    openai?: string;
    anthropic?: string;
};

const ApiKeysModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [keys, setKeys] = useState<ApiKeys>({});
    const [errors, setErrors] = useState<Record<keyof ApiKeys, string>>({} as Record<keyof ApiKeys, string>);

    useEffect(() => {
        const storedKeys = localStorage.getItem(API_KEYS_LOCALSTORAGE_KEY);
        if (storedKeys) {
            setKeys(JSON.parse(storedKeys));
        }
    }, []);

    const handleSave = (provider: keyof ApiKeys, value: string) => {
        setErrors((prev) => ({ ...prev, [provider]: "" }));

        if (!value) {
            // Allow clearing the key
            const updatedKeys = { ...keys };
            delete updatedKeys[provider];
            setKeys(updatedKeys);
            localStorage.setItem(API_KEYS_LOCALSTORAGE_KEY, JSON.stringify(updatedKeys));
            return;
        }

        if (!validateApiKey(provider, value)) {
            setErrors((prev) => ({
                ...prev,
                [provider]: `Invalid ${provider} API key format`,
            }));
            return;
        }

        const updatedKeys = { ...keys, [provider]: value };
        setKeys(updatedKeys);
        localStorage.setItem(API_KEYS_LOCALSTORAGE_KEY, JSON.stringify(updatedKeys));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        // Prevent any key input
        e.preventDefault();
    };

    const handlePaste = (provider: keyof ApiKeys, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text").trim();
        handleSave(provider, pastedText);
    };

    const clearKey = (provider: keyof ApiKeys) => {
        handleSave(provider, "");
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="h-10 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 border border-gray-300 rounded-md"
            >
                <Icon icon="carbon:api" className="h-5 w-5" />
            </button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
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
                                        API Keys
                                    </DialogTitle>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>Paste your API keys below. Direct typing is disabled for security.</p>
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        {(["gemini", "openai", "anthropic"] as const).map((provider) => (
                                            <div key={provider}>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {provider.charAt(0).toUpperCase() + provider.slice(1)} API Key
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        type="password"
                                                        className={`block shadow-sm sm:text-sm pr-8 w-full p-1 outline-none text-sm rounded-md bg-transparent border border-gray-500 focus:border-gray-600 ${
                                                            errors[provider]
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                                        }`}
                                                        value={keys[provider] || ""}
                                                        // onKeyDown={handleKeyPress}
                                                        onPaste={(e) => handlePaste(provider, e)}
                                                        placeholder={`Paste ${provider} API key here`}
                                                        readOnly
                                                    />
                                                    {keys[provider] && (
                                                        <button
                                                            type="button"
                                                            onClick={() => clearKey(provider)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <Icon icon="mdi:close" className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                {errors[provider] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors[provider]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default ApiKeysModal;