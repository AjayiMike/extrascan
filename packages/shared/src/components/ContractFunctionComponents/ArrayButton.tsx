import type { FC } from "react";

export const ArrayButton: FC<{
    index: number;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isDisabled?: boolean;
    type: "add" | "remove";
    className?: string;
}> = ({ index, onClick, isDisabled, type, className }) => {
    return (
        <button
            data-index={index}
            onClick={onClick}
            disabled={isDisabled}
            className={`${className} py-1 px-3 text-sm rounded-md bg-gray-500 hover:bg-gray-700 text-gray-50`}
        >
            {type === "add" ? "+" : "-"}
        </button>
    );
};

export default ArrayButton;
