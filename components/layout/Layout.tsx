import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Layout, Layout as AntLayout } from "antd";

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
    <html lang="en">
      <body>
        <Layout style={{ minHeight: "100vh" }}>
          <Sidebar />
          <Layout>
            <Header />
            <div
              style={{
                flex: 1,
                margin: "24px",
                // background: "#fff",
                padding: 24,
              }}
            >
              {children}
            </div>
          </Layout>
        </Layout>
      </body>
    </html>
  );
}
