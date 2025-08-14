"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  console.log('isAuthenticated', isAuthenticated);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return <></>;
}
