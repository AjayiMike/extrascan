import type { Config } from "tailwindcss";
// const sharedConfig = require("@extrascan/shared/tailwind.config");
import path from "path";
import * as fs from "fs";

const config: Config = {
    // ...sharedConfig,
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        path.join(fs.realpathSync("./node_modules/@extrascan/shared/src"), "**/*.{js,ts,jsx,tsx}"),
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
export default config;
