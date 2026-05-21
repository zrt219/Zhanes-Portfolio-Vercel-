import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Gateway Failover Playground",
  description: "Deterministic Vercel AI Gateway-style provider routing, fallback, latency, cost, and trace simulation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
