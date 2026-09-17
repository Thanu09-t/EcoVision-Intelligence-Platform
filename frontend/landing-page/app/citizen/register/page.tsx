"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col justify-center items-center px-4">
      <div className="text-white text-center">
        <p className="text-slate-400">Redirecting to Sign In options...</p>
      </div>
    </div>
  );
}
