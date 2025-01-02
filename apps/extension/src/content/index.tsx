import { createRoot } from "react-dom/client";
import ExtrascanTab from "../components/ExtrascanTab";

const EXTRASCAN_ROOT_ID = "extrascan-root";

function createReactRoot(container: HTMLElement) {
    const root = createRoot(container);
    root.render(<ExtrascanTab />);
    return root;
}

function init() {
    // Only run on address pages
    if (!window.location.pathname.startsWith("/address/")) return;

    // Check if contract has code
    const codeElement = document.querySelector("#dividcode .wordwrap.scrollbar-custom");
    if (!codeElement) return;

    // Find the tab container
    const tabContainer = document.querySelector("#nav_tabs.nav_tabs1");
    if (!tabContainer) return;

    // Create new tab
    const newTab = document.createElement("li");
    newTab.id = "ContentPlaceholder1_li_extrascan";
    newTab.className = "nav-item snap-align-start";
    newTab.setAttribute("role", "presentation");

    // Create tab link
    const tabLink = document.createElement("a");
    tabLink.className = "nav-link";
    tabLink.href = "javascript:;";
    tabLink.id = "tab-extrascan";
    tabLink.setAttribute("data-bs-toggle", "pill");
    tabLink.setAttribute("data-bs-target", "#extrascan");
    tabLink.setAttribute("type", "button");
    tabLink.setAttribute("role", "tab");
    tabLink.setAttribute("aria-controls", "extrascan");
    tabLink.setAttribute("aria-selected", "false");
    tabLink.setAttribute("onclick", "javascript:updatehash('extrascan');");
    tabLink.setAttribute("tabindex", "-1");
    tabLink.textContent = "Extrascan";

    // Append elements
    newTab.appendChild(tabLink);
    tabContainer.appendChild(newTab);

    // Create content container
    const contentContainer = document.createElement("div");
    contentContainer.id = "extrascan";
    contentContainer.className = "tab-pane fade";
    contentContainer.setAttribute("role", "tabpanel");
    contentContainer.setAttribute("aria-labelledby", "tab-extrascan");

    // Create React root container
    const reactContainer = document.createElement("div");
    reactContainer.id = EXTRASCAN_ROOT_ID;
    contentContainer.appendChild(reactContainer);

    // Find and append to tab content container
    const tabContent = document.querySelector("#pills-tabContent");
    if (tabContent) {
        tabContent.appendChild(contentContainer);
        createReactRoot(reactContainer);
    }
}

// Run when DOM is fully loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
