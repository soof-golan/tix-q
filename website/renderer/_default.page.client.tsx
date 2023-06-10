export { render };
export const clientRouting = true;
export const hydrationCanBeAborted = true;

import { hydrateRoot, createRoot } from "react-dom/client";
import { PageShell } from "./PageShell";
import type { PageContextClient } from "./types";

async function render(pageContext: PageContextClient) {
  const { Page, pageProps } = pageContext;

  const page = (
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  );
  const root = document.getElementById("react-root");
  if (!root) throw new Error("DOM element #react-root not found");
  if (root.innerHTML === "" || !pageContext.isHydration) {
    const reactRoot = createRoot(root);
    reactRoot.render(page);
  } else {
    hydrateRoot(root, page);
  }
}

/* To enable Client-side Routing:
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
