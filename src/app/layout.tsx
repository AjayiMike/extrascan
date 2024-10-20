import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clsx from "clsx";

const DynamicProviders = dynamic(() => import("@/components/providers"), {
    ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Interface Extractor",
    description: "Interface Extractor",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, "w-full")}>
                <DynamicProviders>
                    <Header />
                    <main className="w-full min-h-[calc(100vh-8rem)]">{children}</main>
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
                </DynamicProviders>
            </body>
        </html>
    );
}
