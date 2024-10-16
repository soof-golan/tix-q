export { render };
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ["pageProps", "routeParams"];

import ReactDOMServer from "react-dom/server";
import { PageShell } from "./PageShell";
import { dangerouslySkipEscape, escapeInject } from "vite-plugin-ssr/server";
import logoUrl from "./logo.svg";
import type { PageContextServer } from "./types";

async function render(pageContext: PageContextServer) {
  const { Page, pageProps } = pageContext;
  const gTag = import.meta.env.PUBLIC_GTAG;

  const spaMode = !Page;

  const pageHtml = spaMode
    ? ""
    : ReactDOMServer.renderToString(
        <PageShell pageContext={pageContext}>
          <Page {...pageProps} />
        </PageShell>
      );

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext.exports;
  const title = (documentProps && documentProps.title) || "Waiting Room";
  const desc =
    (documentProps && documentProps.description) ||
    "Let users wait in a virtual waiting room, without suffering";

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=${gTag}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', "${gTag}");
        </script>
        <title>${title}</title>
      </head>
      <body>
        <div id="react-root"/>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    },
  };
}
