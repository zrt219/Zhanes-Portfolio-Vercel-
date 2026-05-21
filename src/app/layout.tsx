import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vercel Build Doctor Agent",
  description: "AI debugging assistant for failed builds, deploy logs, and production readiness.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
