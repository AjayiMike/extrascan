import React, { FC } from "react";
import ContractFunctionFieldAccordion, { Props as AccordionProps } from "./ContractFunctionFieldAccordion";
import { ContractAbiItemInput } from "@/types/ABI";
import { useFormContext } from "react-hook-form";
import { getFieldLabel, matchArray, transformDataForArrayItem } from "@/utils/contractfunctions";
import ContractFunctionSimpleInputField from "./ContractFunctionSimpleInputField";
import ContractFunctionArrayButton from "./ContractFunctionArrayButton";
import ContractFunctionTupleInputField from "./ContractFunctionTupleInputField";

interface Props extends Pick<AccordionProps, "onAddClick" | "onRemoveClick" | "index"> {
    data: ContractAbiItemInput;
    level: number;
    basePath: string;
    isDisabled: boolean;
    isArrayElement?: boolean;
    size?: number;
}

const ContractFunctionArrayInputField: FC<Props> = ({
    data,
    level,
    basePath,
    onAddClick,
    onRemoveClick,
    index: parentIndex,
    isDisabled,
    isArrayElement,
}) => {
    const {
        formState: { errors },
    } = useFormContext();
    const fieldsWithErrors = Object.keys(errors);
    const isInvalid = fieldsWithErrors.some((field) => field.startsWith(basePath));
    const arrayMatch = matchArray(data.type as string);
    const hasFixedSize = arrayMatch !== null && arrayMatch.size !== Infinity;
    const [registeredIndices, setRegisteredIndices] = React.useState(
        hasFixedSize
            ? Array(arrayMatch.size)
                  .fill(0)
                  .map((_, i) => i)
            : [0]
    );

    const handleAddButtonClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setRegisteredIndices((prev) => [...prev, prev[prev.length - 1] + 1]);
    }, []);

    const handleRemoveButtonClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const itemIndex = event.currentTarget.getAttribute("data-index");
        if (itemIndex) {
            setRegisteredIndices((prev) => prev.filter((index) => index !== Number(itemIndex)));
        }
    }, []);

    if (arrayMatch?.isNested) {
        return (
            <div className="w-full">
                {registeredIndices.map((registeredIndex, index) => {
                    const itemData = transformDataForArrayItem(data, index);
                    const itemBasePath = `${basePath}:${registeredIndex}`;
                    const itemIsInvalid = fieldsWithErrors.some((field) => field.startsWith(itemBasePath));
                    return (
                        <ContractFunctionFieldAccordion
                            key={registeredIndex}
                            level={level + 1}
                            label={getFieldLabel(itemData)}
                            isInvalid={itemIsInvalid}
                            onAddClick={
                                !hasFixedSize && index === registeredIndices.length - 1
                                    ? handleAddButtonClick
                                    : undefined
                            }
                            onRemoveClick={
                                !hasFixedSize && registeredIndices.length > 1 ? handleRemoveButtonClick : undefined
                            }
                            index={registeredIndex}
                        >
                            <ContractFunctionArrayInputField
                                key={registeredIndex}
                                data={itemData}
                                basePath={itemBasePath}
                                level={level + 1}
                                isDisabled={isDisabled}
                                isArrayElement
                            />
                        </ContractFunctionFieldAccordion>
                    );
                })}
            </div>
        );
    }

    const isTupleArray = arrayMatch?.itemType.includes("tuple");

    if (isTupleArray) {
        const content = (
            <>
                {registeredIndices.map((registeredIndex, index) => {
                    const itemData = transformDataForArrayItem(data, index);

                    return (
                        <ContractFunctionTupleInputField
                            key={registeredIndex}
                            data={itemData}
                            basePath={`${basePath}:${registeredIndex}`}
                            level={level + 1}
                            onAddClick={
                                !hasFixedSize && index === registeredIndices.length - 1
                                    ? handleAddButtonClick
                                    : undefined
                            }
                            onRemoveClick={
                                !hasFixedSize && registeredIndices.length > 1 ? handleRemoveButtonClick : undefined
                            }
                            index={registeredIndex}
                            isDisabled={isDisabled}
                            isOptional={registeredIndices.length === 1}
                        />
                    );
                })}
            </>
        );

        if (isArrayElement) {
            return content;
        }

        return (
            <ContractFunctionFieldAccordion
                level={level}
                label={getFieldLabel(data)}
                onAddClick={onAddClick}
                onRemoveClick={onRemoveClick}
                index={parentIndex}
                isInvalid={isInvalid}
            >
                {content}
            </ContractFunctionFieldAccordion>
        );
    }

    // primitive value array
    return (
        <div className="w-full flex-col md:flex-row items-start gap-1 p-1">
            {!isArrayElement && (
                <label className="text-sm col-span-1 md:col-span-2 md:mt-2">{getFieldLabel(data)}</label>
            )}
            <div className="w-full flex flex-col gap-1">
                {registeredIndices.map((registeredIndex, index) => {
                    const itemData = transformDataForArrayItem(data, index);

                    return (
                        <div key={registeredIndex} className="flex items-center gap-1">
                            <ContractFunctionSimpleInputField
                                data={itemData}
                                hideLabel
                                path={`${basePath}:${index}`}
                                level={level}
                                isDisabled={isDisabled}
                                isOptional={registeredIndices.length === 1}
                            />
                            <span className="flex items-center gap-1">
                                {!hasFixedSize && registeredIndices.length > 1 && (
                                    <ContractFunctionArrayButton
                                        index={registeredIndex}
                                        onClick={handleRemoveButtonClick}
                                        type="remove"
                                    />
                                )}
                                {!hasFixedSize && index === registeredIndices.length - 1 && (
                                    <ContractFunctionArrayButton
                                        index={registeredIndex}
                                        onClick={handleAddButtonClick}
                                        type="add"
                                    />
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ContractFunctionArrayInputField;
