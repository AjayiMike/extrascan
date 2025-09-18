import type { ContractAbiItemInput } from "@/types";
import FieldAccordion from "./FieldsAccordion";
import type { FieldAccordionProps } from "./FieldsAccordion";
import type { FC } from "react";
import { useFormContext } from "react-hook-form";
import { getFieldLabel, matchArray } from "@/utils";
import ArrayInputField from "./ArrayInputField";
import SimpleInputField from "./SimpleInputField";

export interface TupleInputFieldProps extends Pick<FieldAccordionProps, "onAddClick" | "onRemoveClick" | "index"> {
    userAddress?: string;
    data: ContractAbiItemInput;
    basePath: string;
    level: number;
    isDisabled: boolean;
    isOptional?: boolean;
}

export const TupleInputField: FC<TupleInputFieldProps> = ({
    userAddress,
    data,
    basePath,
    level,
    isDisabled,
    isOptional,
    ...accordionProps
}) => {
    const {
        formState: { errors },
    } = useFormContext();
    const fieldsWithErrors = Object.keys(errors);
    const isInvalid = fieldsWithErrors.some((field) => field.startsWith(basePath));

    if (!("components" in data)) {
        return null;
    }

    return (
        <FieldAccordion {...accordionProps} level={level} label={getFieldLabel(data)} isInvalid={isInvalid}>
            {data.components?.map((component, index) => {
                if ("components" in component && component.type === "tuple") {
                    return (
                        <TupleInputField
                            key={index}
                            userAddress={userAddress}
                            data={component}
                            basePath={`${basePath}:${index}`}
                            level={level + 1}
                            isDisabled={isDisabled}
                            isOptional={isOptional}
                        />
                    );
                }
                const arrayMatch = matchArray(component.type as string);
                if (arrayMatch) {
                    return (
                        <ArrayInputField
                            key={index}
                            userAddress={userAddress}
                            data={component}
                            basePath={`${basePath}:${index}`}
                            level={arrayMatch.itemType === "tuple" ? level + 1 : level}
                            isDisabled={isDisabled}
                        />
                    );
                }

                return (
                    <SimpleInputField
                        key={index}
                        userAddress={userAddress}
                        data={component}
                        path={`${basePath}:${index}`}
                        isDisabled={isDisabled}
                        isOptional={isOptional}
                        level={level}
                    />
                );
            })}
        </FieldAccordion>
    );
};

export default TupleInputField;
