import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Scheduler — จัดตารางเวลาชีวิต",
  description: "แอปจัดตารางเวลาชีวิต วางแผนรายวัน และติดตามนิสัยประจำวัน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#fafafa] text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
