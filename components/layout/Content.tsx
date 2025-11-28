"use client";

import { useSidebar } from "@/contexts/SidebarContext";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className="transition-all duration-300 bg-white min-h-[calc(100vh-64px)]"
      style={{
        marginLeft: collapsed ? 64 : 256,
        marginTop: 64,
        padding: "20px 16px",
      }}
    >
      {children}
    </main>
  );
}
