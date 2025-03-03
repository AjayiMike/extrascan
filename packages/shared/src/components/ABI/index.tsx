import { Field, Select } from "@headlessui/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { Interface as EthersInterface } from "ethers";
import React, { useMemo, useState, type FC } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";
import { useCopyToClipboard } from "usehooks-ts";

export type ABIFormatOption = {
    value: "json" | "human readable" | "minimal human readable";
    label: string;
};

type ABIComponentProps = {
    isExtrapolated: boolean;
    sourceCode?: string;
    bytecode?: string;
    ABI?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ABIComponent: FC<ABIComponentProps> = ({ ABI, bytecode, sourceCode, isExtrapolated }) => {
    const [formartedABI, setFormartedABI] = useState<Array<string> | string>(
        JSON.stringify(JSON.parse(ABI as string), null, 2)
    );

    const ABIFormatOptions: ABIFormatOption[] = [
        { value: "json", label: "JSON" },
        { value: "human readable", label: "Human Readable" },
        { value: "minimal human readable", label: "Minimal Human Readable" },
    ];

    const handleSelectChange = (selectedOption: ABIFormatOption) => {
        const formatType = selectedOption.value;
        switch (formatType) {
            case "human readable":
                setFormartedABI(EthersInterface.from(JSON.parse(ABI as string)).format());
                break;
            case "minimal human readable":
                setFormartedABI(EthersInterface.from(JSON.parse(ABI as string)).format(true));
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            .catch((error: Error) => {
                toast.error(`Failed to copy: ${error.message}`);
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
                                        ABIFormatOptions.find(
                                            (option) => option.value === e.target.value
                                        ) as ABIFormatOption
                                    )
                                }
                            >
                                {ABIFormatOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            <Icon
                                icon="mdi-light:chevron-down"
                                aria-hidden="true"
                                className="group pointer-events-none absolute top-3 right-2.5 size-4 fill-black/60"
                            />
                        </div>
                    </Field>
                </div>

                <div className="relative w-full h-[500px]">
                    <button className="absolute top-3 right-2.5 cursor-pointer" onClick={handleCopyABI()}>
                        <Icon
                            icon={copied ? "fluent:clipboard-task-16-filled" : "fluent:clipboard-28-filled"}
                            className={clsx("group pointer-events-none size-4 text-white/70", {
                                "text-white/70": copied,
                            })}
                            aria-hidden="true"
                        />
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
