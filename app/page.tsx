"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      router.replace("/user-management");
    }
  }, [isAuthenticated, router]);

  return <></>;
}
