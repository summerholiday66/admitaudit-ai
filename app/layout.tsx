import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdmitAudit.ai",
  description:
    "Admissions-style essay review for international applicants, with structured feedback and voice-preserving rewrite suggestions."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
