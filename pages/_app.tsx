import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";

import type { AppProps } from "next/app";
interface CustomAppProps extends Omit<AppProps, "Component"> {
  Component: AppProps["Component"] & { layout: string }
}
import DashboardLayout from "../components/layout/Dashboard";
import RegularLayout from "../components/layout/Regular";

const layouts = {
  "dashboard": DashboardLayout,
  "regular": RegularLayout
}

export default function App({ Component, pageProps }: CustomAppProps) {
  const Layout = layouts[Component.layout];

  return (
    <SessionProvider session={pageProps.session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}