"use client";
import LoginForm from "../components/login-form";
import Image from "next/image";
import logoCRM from "@/assets/login/logo_crm.jpg";

export default function LoginPage() {

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <div className="fixed top-6 left-6 z-50">
        <Image
          src={logoCRM}
          alt="CRM Logo"
          width={90}
          height={90}
          className="rounded-full shadow-sm"
        />
      </div>

      <div className="pointer-events-none absolute rounded-full blur-3xl opacity-20 bg-sky-200" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full blur-3xl opacity-20 bg-indigo-200" />
      <div className="rounded-[32px] bg-white max-w-sm w-full mx-10">
        <LoginForm />
      </div>
    </div>
  );
}
