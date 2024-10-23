export { render };
export const clientRouting = true;
export const hydrationCanBeAborted = true;

import { createRoot, hydrateRoot } from "react-dom/client";
import { PageShell } from "./PageShell";
import type { PageContextClient } from "./types";

const globalThisForReactRoot = globalThis as unknown as {
  reactRoot?: ReturnType<typeof createRoot>;
};

async function render(pageContext: PageContextClient) {
  const { Page, pageProps } = pageContext;

  const page = (
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  );
  const root = document.getElementById("react-root");
  if (!root) throw new Error("DOM element #react-root not found");
  const reactRoot = (() => {
    if (globalThisForReactRoot.reactRoot) {
      return globalThisForReactRoot.reactRoot;
    }
    const reactRoot = createRoot(root);
    globalThisForReactRoot.reactRoot = reactRoot;
    return reactRoot;
  })();

  reactRoot.render(page);
}

/* To enable Client-side Routing:
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
