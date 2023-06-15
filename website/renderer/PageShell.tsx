import React, { Suspense } from "react";
import { PageContextProvider } from "./usePageContext";
import type { PageContext } from "./types";
import "./PageShell.css";
import Header from "../components/Header";
import { FirebaseContext } from "../components/FirebaseContext";
import TrpcContext from "../components/TrpcContext";

export { PageShell };

function PageShell({
  children,
  pageContext,
}: {
  children: React.ReactNode;
  pageContext: PageContext;
}) {
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <FirebaseContext>
          <TrpcContext>
            <Layout>
              <Header />
              <Suspense fallback={<div>Loading...</div>}>
                <Content>{children}</Content>
              </Suspense>
            </Layout>
          </TrpcContext>
        </FirebaseContext>
      </PageContextProvider>
    </React.StrictMode>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-l from-purple-600 to-indigo-600 pb-8">
      {children}
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
