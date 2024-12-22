import { ContractAbiItemInput } from "@/types/ABI";
import ContractFunctionFieldAccordion, { Props as AccordionProps } from "./ContractFunctionFieldAccordion";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { getFieldLabel, matchArray } from "@/utils/contractfunctions";
import ContractFunctionArrayInputField from "./ContractFunctionArrayInputField";
import ContractFunctionSimpleInputField from "./ContractFunctionSimpleInputField";

interface Props extends Pick<AccordionProps, "onAddClick" | "onRemoveClick" | "index"> {
    data: ContractAbiItemInput;
    basePath: string;
    level: number;
    isDisabled: boolean;
    isOptional?: boolean;
}

const ContractFunctionTupleInputField: FC<Props> = ({
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
        <ContractFunctionFieldAccordion
            {...accordionProps}
            level={level}
            label={getFieldLabel(data)}
            isInvalid={isInvalid}
        >
            {data.components?.map((component, index) => {
                if ("components" in component && component.type === "tuple") {
                    return (
                        <ContractFunctionTupleInputField
                            key={index}
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
                        <ContractFunctionArrayInputField
                            key={index}
                            data={component}
                            basePath={`${basePath}:${index}`}
                            level={arrayMatch.itemType === "tuple" ? level + 1 : level}
                            isDisabled={isDisabled}
                        />
                    );
                }

                return (
                    <ContractFunctionSimpleInputField
                        key={index}
                        data={component}
                        path={`${basePath}:${index}`}
                        isDisabled={isDisabled}
                        isOptional={isOptional}
                        level={level}
                    />
                );
            })}
        </ContractFunctionFieldAccordion>
    );
};

export default ContractFunctionTupleInputField;
