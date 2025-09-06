import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Layout } from "antd";
import { PermissionProvider } from "./PermissionContext";

export const metadata: Metadata = {
  title: "OrderSystem",
  description: "Dashboard using Next.js & Ant Design",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Layout>
          <Header />
          <div
            style={{
              flex: 1,
              margin: "24px",
              padding: "24px 0px 24px 40px",
            }}
          >
            {children}
          </div>
        </Layout>
      </Layout>
    </PermissionProvider>
  );
}
