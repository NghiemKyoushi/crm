"use client";
import { WithAuth } from "@/components/common/with-authen";
import RootLayout from "@/components/layout/Layout";
export default function RootLayoutProtected({ children }: { children: React.ReactNode }) {
  const ProtectedChildren = WithAuth(() => <>{children}</>);
  return <RootLayout><ProtectedChildren /></RootLayout>;
}