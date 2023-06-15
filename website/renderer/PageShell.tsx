import React, { Suspense } from "react";
import { PageContextProvider } from "./usePageContext";
import type { PageContext } from "./types";
import "./PageShell.css";
import Header from "../components/Header";
import { FirebaseContext } from "../components/FirebaseContext";
import TrpcContext from "../components/TrpcContext";
import Footer from "../components/Footer";
import { TurnstileContext } from "../components/TurnstileContext";

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
        <TurnstileContext>
          <FirebaseContext>
            <TrpcContext>
              <Layout>
                <Suspense fallback={<div>Loading...</div>}>
                  <Content>{children}</Content>
                </Suspense>
              </Layout>
            </TrpcContext>
          </FirebaseContext>
        </TurnstileContext>
      </PageContextProvider>
    </React.StrictMode>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col justify-between bg-gradient-to-l from-purple-600 to-indigo-600">
        <Header />
        {children}
        <Footer />
      </div>
    </>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
