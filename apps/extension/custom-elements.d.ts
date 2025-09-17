import React from "react"

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "appkit-button": React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement> & {
          disabled?: boolean
          balance?: "show" | "hide"
          size?: "md" | "sm"
          label?: string
          loadingLabel?: string
        },
        HTMLButtonElement
      >
    }
  }
}
