import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender
} from "plasmo"
import { createRoot } from "react-dom/client"

import "../style.css"

import ExtrascanTab from "./components/ExtrascanTab.tsx"
import { WalletProvider } from "./components/WalletContext.tsx"

export const config: PlasmoCSConfig = {
  matches: ["https://*.etherscan.io/address/*"]
}

export const getShadowHostId = () => "extrascan-scui-unique-id"

const EXTRASCAN_ROOT_ID = "extrascan-root"

export const getRootContainer = () =>
  new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const codeElement = document.querySelector(
        "#dividcode .wordwrap.scrollbar-custom"
      )
      const tabContainer = document.querySelector(`#nav_tabs.nav_tabs1`)
      if (codeElement && tabContainer) {
        clearInterval(checkInterval)
        // Create new tab
        const newTab = document.createElement("li")
        newTab.id = "ContentPlaceholder1_li_extrascan"
        newTab.className = "nav-item snap-align-start"
        newTab.setAttribute("role", "presentation")

        // Create tab link
        const tabLink = document.createElement("a")
        tabLink.className = "nav-link"
        tabLink.href = "javascript:;"
        tabLink.id = "tab-extrascan"
        tabLink.setAttribute("data-bs-toggle", "pill")
        tabLink.setAttribute("data-bs-target", "#extrascan")
        tabLink.setAttribute("type", "button")
        tabLink.setAttribute("role", "tab")
        tabLink.setAttribute("aria-controls", "extrascan")
        tabLink.setAttribute("aria-selected", "false")
        tabLink.setAttribute("onclick", "javascript:updatehash('extrascan');")
        tabLink.setAttribute("tabindex", "-1")
        tabLink.textContent = "Extrascan"
        // Append elements
        newTab.appendChild(tabLink)
        tabContainer.appendChild(newTab)

        // Create content container
        const contentContainer = document.createElement("div")
        contentContainer.id = "extrascan"
        contentContainer.className = "tab-pane fade"
        contentContainer.setAttribute("role", "tabpanel")
        contentContainer.setAttribute("aria-labelledby", "tab-extrascan")

        // Create React root container
        const cardContainer = document.createElement("div")
        cardContainer.setAttribute("class", "card p-5 mb-3")
        cardContainer.id = EXTRASCAN_ROOT_ID
        contentContainer.appendChild(cardContainer)

        const tabContent = document.querySelector("#pills-tabContent")
        if (tabContent) {
          tabContent.appendChild(contentContainer)
        }
        resolve(contentContainer)
      }
    }, 137)
  })

const ExtrascanSCUI = () => {
  return (
    <WalletProvider>
      <ExtrascanTab />
    </WalletProvider>
  )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  createRootContainer
}) => {
  const rootContainer = await createRootContainer()
  const root = createRoot(rootContainer)
  root.render(<ExtrascanSCUI />)
}
