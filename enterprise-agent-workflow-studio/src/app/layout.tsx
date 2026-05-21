import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enterprise Agent Workflow Studio",
  description: "Demo studio for enterprise-safe agent workflows, approval gates, tool registries, and audit reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
