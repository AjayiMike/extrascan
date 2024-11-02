import { Field, Select } from "@headlessui/react";
import { SparklesIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Interface } from "ethers";
import React, { Fragment } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Tooltip } from "react-tooltip";

type Props = {
    isExtrapolated: boolean;
    sourceCode?: string;
    bytecode?: string;
    ABI?: string;
};

const Code: React.FC<Props> = ({ ABI, bytecode, sourceCode, isExtrapolated }) => {
    const [formartedABI, setFormartedABI] = React.useState<ReadonlyArray<string> | string>(
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

    return (
        <div className="w-full mt-6">
            <div className="flex flex-col gap-16">
                {!isExtrapolated && (
                    <div className="w-full h-[500px]">
                        <h2 className="text-xl font-semibold">Source Code</h2>
                        <SyntaxHighlighter
                            language="solidity"
                            style={atomOneDark}
                            customStyle={{ height: "100%", overflowY: "auto" }}
                        >
                            {sourceCode as string}
                        </SyntaxHighlighter>
                    </div>
                )}
                <div className="w-full h-[500px]">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold">Contract ABI</h2>
                            {isExtrapolated && (
                                <Fragment>
                                    <SparklesIcon
                                        data-tooltip-id="abi-tooltip"
                                        data-tooltip-content="This ABI was extrapolated with the help of whatsabi, openchain.xyz and AI. The Contract is not verified and ABI may contain errors."
                                        data-tooltip-place="bottom"
                                        className="h-5 w-5 text-yellow-800 cursor-pointer"
                                        aria-hidden="true"
                                    />
                                    <Tooltip
                                        id="abi-tooltip"
                                        style={{
                                            width: "12rem",
                                            fontSize: "0.75rem",
                                        }}
                                    />
                                </Fragment>
                            )}
                        </div>
                        <Field className="flex items-center w-56">
                            <div className="relative w-full">
                                <Select
                                    className={clsx(
                                        "cursor-pointer block w-full appearance-none rounded-lg border-none bg-white py-1.5 px-3 text-sm/6 text-black",
                                        "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                                        // Make the text of each option black on Windows
                                        "*:text-black"
                                    )}
                                    onChange={(e) =>
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
                    <SyntaxHighlighter
                        language="json"
                        style={atomOneDark}
                        customStyle={{ height: "100%", overflowY: "auto" }}
                    >
                        {String(formartedABI)}
                    </SyntaxHighlighter>
                </div>
                <div className="w-full overflow-auto">
                    <h2 className="text-xl font-semibold">Contract Bytecode</h2>
                    <SyntaxHighlighter language="bash" style={atomOneDark}>
                        {bytecode as string}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
};

export default Code;
