"use client";

import { useInitAppkit } from "@extrascan/shared/hooks";
import Link from "next/link";
import logo from "@/assets/logo.png";
import Image from "next/image";
import ApiKeysModal from "./ApiKeysModal";

const Header = () => {
    useInitAppkit(process.env.NEXT_PUBLIC_REOWN_CLOUD_APP_ID as string);
    return (
        <header className="h-16 w-full bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center">
                                <Image src={logo} alt="logo" width={32} height={32} />
                                <span className="ml-2 text-xl font-bold">Extrascan</span>
                            </Link>
                        </div>
                    </div>
                    <div className="h-10 flex items-center gap-2">
                        <ApiKeysModal />
                        <appkit-button />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
