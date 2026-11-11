import type { Metadata } from "next";
import "./globals.css";
import "@livekit/components-styles";
import IncomingCallListener from "@/components/IncomingCallListener";
export const metadata: Metadata = {
  title: "WORKYARD — Find trusted hands in your yard",
  description: "Create work, find work, and build trust in your local Nigerian community."
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><IncomingCallListener />{children}</body></html>;
}