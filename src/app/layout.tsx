import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ثبت‌نام دورهمی فناوری و کامپیوتر",
  description: "ثبت‌نام در دورهمی تخصصی کامپیوتر و فناوری",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
