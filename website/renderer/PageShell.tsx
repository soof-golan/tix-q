import React from "react";
import logo from "./logo.svg";
import { PageContextProvider } from "./usePageContext";
import type { PageContext } from "./types";
import "./PageShell.css";
import { Link } from "./Link";
import Header from "../components/Header";
import { FirebaseContext } from "../components/FirebaseContext";

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
          <Layout>
            <Header title="Waiting Room" />
            <Content>{children}</Content>
          </Layout>
        </FirebaseContext>
      </PageContextProvider>
    </React.StrictMode>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-l from-purple-600 to-indigo-600">
      {children}
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}

function Logo() {
  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      <a href="/">
        <img src={logo} height={64} width={64} alt="logo" />
      </a>
    </div>
  );
}
