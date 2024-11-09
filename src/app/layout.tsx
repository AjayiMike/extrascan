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
    title: "SmartScan",
    description: "smart contract ABI extrapolator",
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
                <Suspense>
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
