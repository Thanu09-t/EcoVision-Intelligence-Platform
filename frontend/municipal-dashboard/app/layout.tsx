import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "./PageTransition";

export const metadata: Metadata = {
  title: "EcoVision AI – Municipal Dashboard",
  description: "Real-time pollution monitoring, AI analytics, and cleanup management for municipal officers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#041611] text-[#FFEB97] font-serif antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
