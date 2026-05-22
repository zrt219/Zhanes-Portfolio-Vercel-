import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zhane's Portfolio Vercel",
  description: "Connected Vercel portfolio hub for Build Doctor, resume tailoring, evidence dashboards, AI gateway demos, and agent workflow proof.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
