import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Evidence RAG Auditor",
  description: "Demo RAG auditor for matching resume claims to project evidence, job descriptions, and verified bullets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
