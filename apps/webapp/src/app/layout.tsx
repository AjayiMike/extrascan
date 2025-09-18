import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clsx from "clsx";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Extrascan - Smart Contract ABI Extrapolator",
    description:
        "Extrascan is a powerful tool for interacting with smart contracts and extracting their ABI, whether verified or not. Supports multiple blockchain networks and AI-powered ABI extrapolation.",
    keywords: [
        "smart contract",
        "blockchain",
        "ABI",
        "ethereum",
        "web3",
        "smart contract verification",
        "contract interaction",
        "blockchain explorer",
    ],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        title: "Extrascan - Smart Contract ABI Extrapolator",
        description:
            "Interact with smart contracts and get their ABI, verified or not. Supports multiple blockchain networks.",
        url: "https://extrascan.xyz",
        siteName: "Extrascan",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Extrascan - Smart Contract ABI Extrapolator",
        description:
            "Interact with smart contracts and get their ABI, verified or not. Supports multiple blockchain networks.",
    },
    alternates: {
        canonical: "https://extrascan.xyz",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, "w-full")}>
                <Header />
                <Suspense fallback={<div>Loading...</div>}>
                    <main className="w-full min-h-[calc(100vh-8rem)]">{children}</main>
                </Suspense>
                <Footer />
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    toastStyle={{ backgroundColor: "rgb(229 231 235 / 50)" }}
                    bodyStyle={{ color: "#333" }}
                />
            </body>
        </html>
    );
}
