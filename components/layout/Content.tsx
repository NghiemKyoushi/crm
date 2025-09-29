"use client";

import { useSidebar } from "@/contexts/SidebarContext";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      style={{
        flex: 1,
        margin: "24px",
        padding: "24px 0px 24px 40px",
        marginLeft: collapsed ? 64 : 256,
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}
