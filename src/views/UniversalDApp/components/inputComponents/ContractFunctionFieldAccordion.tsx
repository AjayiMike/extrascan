import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import React, { FC, Fragment } from "react";
import ContractFunctionArrayButton from "./ContractFunctionArrayButton";
import { Icon } from "@iconify/react";

export type Props = {
    label: string;
    level: number;
    children: React.ReactNode;
    onAddClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onRemoveClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    index?: number;
    isInvalid?: boolean;
};

const ContractFunctionFieldAccordion: FC<Props> = ({ label, children, onAddClick, onRemoveClick, index }) => {
    return (
        <Disclosure as="div" className="w-full mt-4 rounded-md border-2 border-gray-200">
            <DisclosureButton as="div" className="w-full flex items-center justify-between bg-gray-200 p-2">
                {({ open }) => (
                    <Fragment>
                        <span className="flex items-center gap-2">
                            <Icon icon={open ? "mdi-light:chevron-down" : "material-symbols-light:chevron-right"} />
                            <span>{label}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            {onRemoveClick && (
                                <ContractFunctionArrayButton
                                    index={index as number}
                                    onClick={onRemoveClick}
                                    type="remove"
                                />
                            )}
                            {onAddClick && (
                                <ContractFunctionArrayButton index={index as number} onClick={onAddClick} type="add" />
                            )}
                        </span>
                    </Fragment>
                )}
            </DisclosureButton>
            <DisclosurePanel className="">
                <div className="p-2 overflow-auto">{children}</div>
            </DisclosurePanel>
        </Disclosure>
    );
};

export default ContractFunctionFieldAccordion;
