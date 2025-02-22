import path from "path";
import * as fs from "fs";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        path.join(fs.realpathSync("./node_modules/@extrascan/shared/src"), "**/*.{js,ts,jsx,tsx}"),
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
