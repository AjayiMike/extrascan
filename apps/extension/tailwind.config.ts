import * as fs from "fs"
import path from "path"

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./src/**/*.{tsx,html}",
    path.join(
      fs.realpathSync("./node_modules/@extrascan/shared/"),
      "**/*.{js,ts,jsx,tsx}"
    )
  ],
  plugins: []
}
