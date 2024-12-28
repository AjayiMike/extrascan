import { ModelProvider } from "@extrascan/shared/types";
import { useState, useEffect } from "react";
import { getStoredApiKeys } from "./utils/storage";
import Settings from "./pages/Settings";

import { AnimatePresence, motion } from "framer-motion";
import Default from "./pages/Default";
import Header from "./components/header";

function App() {
    const [currentPage, setCurrentPage] = useState<"default" | "settings">("default");
    const [hasApiKeys, setHasApiKeys] = useState(false);

    useEffect(() => {
        const checkApiKeys = async () => {
            const apiKeys = await getStoredApiKeys();
            const hasValidApiKey = Object.values(ModelProvider).some((provider) => apiKeys[provider]);
            setHasApiKeys(hasValidApiKey);
        };

        checkApiKeys();
    }, []);

    return (
        <div className="w-[320px] h-[400px] bg-white">
            <Header onBack={currentPage === "settings" ? () => setCurrentPage("default") : undefined} />
            <div className="w-full h-[310px] relative overflow-auto">
                <AnimatePresence mode="wait">
                    {currentPage === "default" ? (
                        <motion.div
                            key="default"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="absolute inset-0 flex flex-col"
                        >
                            <Default hasApiKeys={hasApiKeys} goToSetting={() => setCurrentPage("settings")} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <Settings />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default App;
