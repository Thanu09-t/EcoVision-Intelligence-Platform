"use client";
import { useEffect } from "react";

export default function MunicipalLoginPage() {
  useEffect(() => {
    window.location.href = "http://localhost:3001/login";
  }, []);

  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col justify-center items-center px-4">
      <div className="text-white text-center">
        <p className="text-slate-400">Redirecting to Sign In options...</p>
      </div>
    </div>
  );
}
