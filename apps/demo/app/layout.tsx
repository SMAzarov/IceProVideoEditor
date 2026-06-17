import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kutlass — Browser Video Editor",
  description: "A fast browser-native video editor powered by WebCodecs and FFmpeg WASM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full">{children}</body>
    </html>
  );
}
