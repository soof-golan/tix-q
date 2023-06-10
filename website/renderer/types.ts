export type { PageContextServer };
export type { PageContextClient };
export type { PageContext };
export type { PageProps };

import type {
  PageContextBuiltIn,
  PageContextBuiltInClientWithClientRouting as PageContextBuiltInClient,
} from "vite-plugin-ssr/types";

type Page = (pageProps: PageProps) => React.ReactElement;
type PageProps = Record<string, unknown>;

export type PageContextCustom = {
  Page: Page;
  pageProps?: PageProps;
  urlPathname: string;
  exports: {
    documentProps?: {
      title?: string;
      description?: string;
    };
  };
};

type PageContextServer = PageContextBuiltIn<Page> & PageContextCustom;
type PageContextClient = PageContextBuiltInClient<Page> & PageContextCustom;

type PageContext = PageContextClient | PageContextServer;

// Recursively serialize all values in `T` to `string | number | null | undefined | boolean`.
// Objects and arrays are serialized recursively.
// Since PageProps are serialized, Dates are mapped to `string` type (in ISO format).
type Ser<T> = {
  [K in keyof T]: T[K] extends string | number | null | undefined | boolean
    ? T[K]
    : T[K] extends Date
    ? string
    : T[K] extends Array<infer U>
    ? Array<Ser<U>>
    : T[K] extends Record<string, infer U>
    ? Record<string, Ser<U>>
    : T[K];
};

export type inferProps<F> = F extends (...args: any[]) => Promise<infer T>
  ? T extends { pageContext: { pageProps: infer U } }
    ? Ser<U>
    : never
  : never;
