import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import dynamic from "next/dynamic";

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
            <body className={inter.className}>
                <DynamicProviders>
                    <Header />
                    <main className="min-h-[calc(100vh-8rem)]">{children}</main>
                    <Footer />
                </DynamicProviders>
            </body>
        </html>
    );
}
