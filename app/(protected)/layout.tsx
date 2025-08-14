"use client";
import { WithAuth } from "@/components/common/with-authen";
export default function RootLayoutProtected({ children }: { children: React.ReactNode }) {
  const ProtectedChildren = WithAuth(() => <>{children}</>);
  return <ProtectedChildren />;
}