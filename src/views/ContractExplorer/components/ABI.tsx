import { Field, Select } from "@headlessui/react";
import { ChevronDownIcon, ClipboardDocumentCheckIcon, ClipboardIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Interface } from "ethers";
import React, { FC, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";
import { useCopyToClipboard } from "usehooks-ts";

type Props = {
    isExtrapolated: boolean;
    sourceCode?: string;
    bytecode?: string;
    ABI?: string;
};

const ABIComponent: FC<Props> = ({ ABI, bytecode, sourceCode, isExtrapolated }) => {
    const [formartedABI, setFormartedABI] = useState<Array<string> | string>(
        JSON.stringify(JSON.parse(ABI as string), null, 2)
    );

    const ABIFormatOptions = [
        { value: "json", label: "JSON" },
        { value: "human readable", label: "Human Readable" },
        { value: "minimal human readable", label: "Minimal Human Readable" },
    ];

    const handleSelectChange = (selectedOption: any) => {
        const formatType = selectedOption.value;
        switch (formatType) {
            case "human readable":
                setFormartedABI(Interface.from(JSON.parse(ABI as string)).format());
                break;
            case "minimal human readable":
                setFormartedABI(Interface.from(JSON.parse(ABI as string)).format(true));
                break;
            default:
                setFormartedABI(JSON.stringify(JSON.parse(ABI as string), null, 2));
        }
    };

    const renderedFormartedABI = useMemo(() => {
        if (typeof formartedABI === "string") {
            return formartedABI;
        }
        return `[\n  ${formartedABI.map((x) => `"${x}"`).join(",\n  ")} \n]`;
    }, [formartedABI]);

    const [_, copy] = useCopyToClipboard();
    const [copied, setCopied] = useState(false);
    const handleCopyABI = () => () => {
        copy(renderedFormartedABI)
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 500);
            })
            .catch((error) => {
                toast.error("Failed to copy: ", error);
            });
    };

    return (
        <div className="w-full mt-6">
            <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">Contract ABI</h2>
                    </div>
                    <Field className="flex items-center w-56">
                        <div className="relative w-full">
                            <Select
                                className={clsx(
                                    "cursor-pointer block w-full appearance-none rounded-lg border-none bg-white py-1.5 px-3 text-sm/6 text-black",
                                    "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                                    "*:text-black"
                                )}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    handleSelectChange(
                                        ABIFormatOptions.find((option) => option.value === e.target.value)
                                    )
                                }
                            >
                                {ABIFormatOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            <ChevronDownIcon
                                className="group pointer-events-none absolute top-3 right-2.5 size-4 fill-black/60"
                                aria-hidden="true"
                            />
                        </div>
                    </Field>
                </div>

                <div className="relative w-full h-[500px]">
                    <button className="absolute top-3 right-2.5 cursor-pointer" onClick={handleCopyABI()}>
                        {copied ? (
                            <ClipboardDocumentCheckIcon
                                className="group pointer-events-none size-4 fill-white"
                                aria-hidden="true"
                            />
                        ) : (
                            <ClipboardIcon
                                className="group pointer-events-none size-4 fill-white/70"
                                aria-hidden="true"
                            />
                        )}
                    </button>

                    <SyntaxHighlighter
                        language="json"
                        style={nord}
                        customStyle={{ height: "100%", overflowY: "auto" }}
                        showLineNumbers={true}
                    >
                        {renderedFormartedABI}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
};

export default ABIComponent;
