import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Layout } from "antd";
import { PermissionProvider } from "./PermissionContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import ContentWrapper from "./Content";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "OrderSystem",
  description: "Dashboard using Next.js & Ant Design",
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
