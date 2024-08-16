"use client";
import { MetaMaskProvider } from "@metamask/sdk-react";
import React from "react";

type Props = {
    children: React.ReactNode;
};
const Providers: React.FC<Props> = ({ children }) => {
    return (
        <MetaMaskProvider
            debug={false}
            sdkOptions={{
                logging: {
                    developerMode: false,
                },
                communicationServerUrl: process.env.NEXT_PUBLIC_METAMASK_COMM_SERVER_URL,
                checkInstallationImmediately: false, // This will automatically connect to MetaMask on page load
                i18nOptions: {
                    enabled: true,
                },
                dappMetadata: {
                    name: "Interface Extractor App",
                    url: window.location.protocol + "//" + window.location.host,
                },
            }}
        >
            {children}
        </MetaMaskProvider>
    );
};

export default Providers;
