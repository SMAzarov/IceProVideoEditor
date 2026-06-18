import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IceProVideoEditor",
  description: "A fast browser-native video editor powered by WebCodecs and FFmpeg WASM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="/kutlass.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('kt-theme');
                if (theme !== 'light' && theme !== 'dark') theme = 'dark';
                document.documentElement.setAttribute('data-kt-theme', theme);
                document.documentElement.style.background = theme === 'dark' ? '#1c1c1c' : '#f0f2f5';
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('kt-theme');
                if (theme !== 'light' && theme !== 'dark') theme = 'dark';
                document.body.style.background = theme === 'dark' ? '#1c1c1c' : '#f0f2f5';
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
