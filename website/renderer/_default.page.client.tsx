export { render };

import { hydrateRoot, createRoot } from "react-dom/client";
import { PageShell } from "./PageShell";
import type { PageContextClient } from "./types";

export const clientRouting = true;
export const hydrationCanBeAborted = true;

// This render() hook only supports SSR, see https://vite-plugin-ssr.com/render-modes for how to modify render() to support SPA
async function render(pageContext: PageContextClient) {
  const { Page, pageProps } = pageContext;
  if (!Page)
    throw new Error(
      "Client-side render() hook expects pageContext.Page to be defined"
    );
  const page = (
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  );
  const root = document.getElementById("react-root");
  if (!root) throw new Error("DOM element #react-root not found");
  if (root.innerHTML === "") {
    const reactRoot = createRoot(root);
    reactRoot.render(page);
  } else {
    hydrateRoot(root, page);
  }
}

/* To enable Client-side Routing:
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
