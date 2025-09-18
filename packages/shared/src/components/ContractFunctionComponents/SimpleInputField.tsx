import { useFormatFieldValue } from "@/hooks";
import { useValidateField } from "@/hooks";
import type { ContractAbiItemInput } from "@/types";
import { getFieldLabel, matchInt } from "@/utils";
import { useController, useFormContext } from "react-hook-form";
import { useCallback, useMemo, useRef } from "react";
import type { ChangeEvent, FC } from "react";
import clsx from "clsx";
import { Icon } from "@iconify/react";

export type SimpleInputFieldProps = {
    userAddress?: string;
    data: ContractAbiItemInput;
    hideLabel?: boolean;
    path: string;
    className?: string;
    isDisabled: boolean;
    isOptional?: boolean;
    level: number;
};

export const SimpleInputField: FC<SimpleInputFieldProps> = ({
    userAddress,
    data,
    hideLabel,
    path: name,
    className,
    isDisabled,
    isOptional: isOptionalProp,
}) => {
    const ref = useRef<HTMLInputElement>(null);
    // const { address } = useAppKitAccount();

    const isNativeCoin = data.fieldType === "native_coin";

    const isOptional = isOptionalProp || isNativeCoin;

    const argTypeMatchInt = useMemo(() => matchInt(data.type as string), [data.type]);

    const validate = useValidateField({ isOptional, argType: data.type as string, argTypeMatchInt });
    const format = useFormatFieldValue({ argType: data.type as string, argTypeMatchInt });

    const { control, setValue } = useFormContext();
    const { field, fieldState } = useController({ control, name, rules: { validate } });

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const formattedValue = format(event.target.value);
            field.onChange(formattedValue); // data send back to hook form
            setValue(name, formattedValue); // UI state
        },
        [field, name, setValue, format]
    );

    const handleClear = useCallback(() => {
        setValue(name, "");
        ref.current?.focus();
    }, [name, setValue]);

    const handleAddressButtonClick = useCallback(
        (address: string | undefined) => {
            if (!address) return;
            const newValue = format(address);
            setValue(name, newValue, { shouldValidate: true });
        },
        [format, name, setValue]
    );

    const error = fieldState.error;

    return (
        <div
            className={clsx({
                "bg-[#ccd0d1] grid grid-cols-1 md:grid-cols-12 items-start gap-1 w-full p-2 rounded": true,
                "py-4, bg-gray-700/40": isNativeCoin,
                className,
            })}
        >
            {!hideLabel && (
                <label className="text-sm col-span-1 md:col-span-2 md:mt-2">{getFieldLabel(data, isOptional)}</label>
            )}
            <div className={clsx("w-full col-span-1 md:col-span-10 relative", { "md:col-span-12": hideLabel })}>
                <input
                    {...field}
                    type={argTypeMatchInt ? "number" : "text"}
                    min={argTypeMatchInt?.isUnsigned ? 0 : undefined}
                    ref={ref}
                    onChange={handleChange}
                    required={!isOptional}
                    placeholder={data.type}
                    autoComplete="off"
                    data-1p-ignore
                    className={clsx(
                        "w-full p-2 pr-20 outline-none text-sm rounded-md bg-transparent border border-gray-500 focus:border-gray-600",
                        { "text-red-600": error }
                    )}
                />
                <div className="w-auto h-[calc(100% - 4px)] absolute top-2 right-2 flex items-center justify-center gap-2 rounded-md">
                    {field.value !== undefined && field.value !== "" && (
                        <button
                            onClick={handleClear}
                            disabled={isDisabled}
                            className="rounded-full bg-red-500/50 hover:bg-gray-700 text-gray-50"
                        >
                            <Icon icon="mynaui:x-circle-solid" className="h-5 w-5" />
                        </button>
                    )}
                    {data.type === "address" && Boolean(userAddress) && (
                        <button
                            onClick={() => handleAddressButtonClick(userAddress)}
                            disabled={isDisabled}
                            className="py-1 px-2 text-xs rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50"
                        >
                            Self
                        </button>
                    )}
                </div>
                {error && <span className="text-red-600 text-xs mt-1">{error.message}</span>}
            </div>
        </div>
    );
};

export default SimpleInputField;
