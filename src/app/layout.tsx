import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "WORKYARD — Find trusted hands in your yard",
  description: "Create work, find work, and build trust in your local Nigerian community."
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}