import { useCallback, useState, type FC } from "react";
import FieldAccordion from "./FieldsAccordion";
import type { FieldAccordionProps } from "./FieldsAccordion";
import type { ContractAbiItemInput } from "@/types";
import { useFormContext } from "react-hook-form";
import { getFieldLabel, matchArray, transformDataForArrayItem } from "@/utils";
import SimpleInputField from "./SimpleInputField";
import { ArrayButton } from "./ArrayButton";
import TupleInputField from "./TupleInputField";

export interface ArrayInputFieldProps extends Pick<FieldAccordionProps, "onAddClick" | "onRemoveClick" | "index"> {
    userAddress?: string;
    data: ContractAbiItemInput;
    level: number;
    basePath: string;
    isDisabled: boolean;
    isArrayElement?: boolean;
    size?: number;
}

export const ArrayInputField: FC<ArrayInputFieldProps> = ({
    userAddress,
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
    const [registeredIndices, setRegisteredIndices] = useState(
        hasFixedSize
            ? Array(arrayMatch.size)
                  .fill(0)
                  .map((_, i) => i)
            : [0]
    );

    const handleAddButtonClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setRegisteredIndices((prev) => [...prev, prev[prev.length - 1] + 1]);
    }, []);

    const handleRemoveButtonClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
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
                        <FieldAccordion
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
                            <ArrayInputField
                                key={registeredIndex}
                                userAddress={userAddress}
                                data={itemData}
                                basePath={itemBasePath}
                                level={level + 1}
                                isDisabled={isDisabled}
                                isArrayElement
                            />
                        </FieldAccordion>
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
                        <TupleInputField
                            key={registeredIndex}
                            userAddress={userAddress}
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
            <FieldAccordion
                level={level}
                label={getFieldLabel(data)}
                onAddClick={onAddClick}
                onRemoveClick={onRemoveClick}
                index={parentIndex}
                isInvalid={isInvalid}
            >
                {content}
            </FieldAccordion>
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
                            <SimpleInputField
                                userAddress={userAddress}
                                data={itemData}
                                hideLabel
                                path={`${basePath}:${index}`}
                                level={level}
                                isDisabled={isDisabled}
                                isOptional={registeredIndices.length === 1}
                            />
                            <span className="flex items-center gap-1">
                                {!hasFixedSize && registeredIndices.length > 1 && (
                                    <ArrayButton
                                        index={registeredIndex}
                                        onClick={handleRemoveButtonClick}
                                        type="remove"
                                    />
                                )}
                                {!hasFixedSize && index === registeredIndices.length - 1 && (
                                    <ArrayButton index={registeredIndex} onClick={handleAddButtonClick} type="add" />
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ArrayInputField;
