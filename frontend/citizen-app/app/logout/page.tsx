"use client";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // Clear all session cookies
    const expiry = "Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "token=; Path=/; Domain=localhost; Expires=" + expiry;
    document.cookie = "user=; Path=/; Domain=localhost; Expires=" + expiry;
    // Also clear without domain in case of port-specific cookies
    document.cookie = "token=; Path=/; Expires=" + expiry;
    document.cookie = "user=; Path=/; Expires=" + expiry;

    // Redirect to login
    window.location.href = "/login";
  }, []);

  return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Signing out...</p>
      </div>
    </div>
  );
}
