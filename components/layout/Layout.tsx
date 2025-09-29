import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Layout } from "antd";
import { PermissionProvider } from "./PermissionContext";
import { useState } from "react";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import ContentWrapper from "./Content";

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
      <SidebarProvider>
        <Layout style={{ minHeight: "100vh" }}>
          <Sidebar />
          <Layout>
            <Header />
            <ContentWrapper>{children}</ContentWrapper>
          </Layout>
        </Layout>
      </SidebarProvider>
    </PermissionProvider>
  );
}
