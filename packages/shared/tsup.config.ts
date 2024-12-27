import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "src/index.ts",
        "src/configs/index.ts",
        "src/components/index.ts",
        "src/constants/index.ts",
        "src/hooks/index.ts",
        "src/types/index.ts",
        "src/utils/index.ts",
    ],
    format: ["cjs", "esm"],
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    treeshake: true,
    esbuildOptions(options) {
        options.alias = {
            "@/*": "./src/*",
        };
    },
});
