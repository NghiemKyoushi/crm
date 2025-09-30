"use client";
import LoginForm from "../components/login-form";
import ForgotPasswordForm from "../components/forgot-password-form";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [isForgot, setIsForgot] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // const token = localStorage.getItem("accessToken");
    const token = Cookies.get("accessToken");

    if (token) {
      const redirectUrl = searchParams.get("redirect") || "/user-management";

      if (decodeURIComponent(redirectUrl) !== "/login") {
        router.replace(redirectUrl ? decodeURIComponent(redirectUrl) : "/user-management"); 
      }

    }
    // if (token) {
    //   router.replace("/user-management");
    // }
  }, [router]);
  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <div className="pointer-events-none absolute rounded-full blur-3xl opacity-20 bg-sky-200" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full blur-3xl opacity-20 bg-indigo-200" />
      <div className="relative rounded-[32px] bg-white max-w-sm w-full mx-10 shadow-xl overflow-hidden min-h-[500px] flex items-center justify-center">
        {/* Login Form */}
        <div
          className={`absolute w-full transition-all duration-300 ${
            isForgot
              ? "opacity-0 translate-x-10 pointer-events-none"
              : "opacity-100 translate-x-0"
          }`}
        >
          <LoginForm onForgot={() => setIsForgot(true)} />
        </div>

        {/* Forgot Password Form */}
        <div
          className={`absolute w-full transition-all duration-300 ${
            isForgot
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-10 pointer-events-none"
          }`}
        >
          <ForgotPasswordForm onBack={() => setIsForgot(false)} />
        </div>
      </div>
    </div>
  );
}
