import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "EcoVision AI – Enterprise Smart City Garbage Mapping & Waste Intelligence",
  description:
    "Production-grade municipal waste management platform powered by YOLOv11 object detection, SAM 2 segmentation, PostGIS spatial mapping, and OR-Tools route optimization.",
  keywords: ["garbage detection", "waste management", "smart city", "AI", "pollution mapping", "municipal", "OR-Tools", "YOLOv11"],
  openGraph: {
    title: "EcoVision AI – Smart City Waste Intelligence",
    description: "Detect. Analyze. Prioritize. Clean.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body className="bg-[#041611] text-[#FFFFFF] font-serif antialiased selection:bg-[#5CE0A5]/20 selection:text-[#5CE0A5] min-h-screen">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
