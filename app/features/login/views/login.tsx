"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/stores/user-info-store";
import Link from "next/link";
import LoginForm from "../components/login-form";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="px-5 pt-5 shadow-md rounded-lg bg-white max-w-md mx-auto">
        <LoginForm />
      </div>
    </div>
  );
}
