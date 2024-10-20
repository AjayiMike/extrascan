import React from "react";

const LoadingView = () => {
    return (
        <div className="h-[calc(100vh-16rem)] w-full flex justify-center items-center">
            <div className="flex gap-4 items-center">
                <div className="loader-cube" />
                <div className="loader-text" />
            </div>
        </div>
    );
};

export default LoadingView;
