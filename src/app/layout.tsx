import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groundwork — Figure out who you are",
  description:
    "A self-guided programme for teenagers to build identity, purpose, connection, and meaning.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-surface-muted antialiased">
        {children}
      </body>
    </html>
  );
}
