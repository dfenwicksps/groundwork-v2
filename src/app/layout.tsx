import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font: no render-blocking Google CSS request, no flash
// of unstyled text. The families are exposed as CSS variables that
// globals.css maps onto --font-display / --font-story / --font-sans.
//
// Headings are Bricolage Grotesque. Only 600 and 800 are loaded, so the many
// headings that ask for weight 400 get 600 — bold enough to carry a screen on
// a phone. Fraunces stays as the story voice: story titles and italic lines.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Groundwork — Figure out who you are",
  description:
    "Short missions, real-world challenges and stories for anyone working out who they are and where they're heading.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // enables env(safe-area-inset-*) on iOS notch devices
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF5EC" },
    { media: "(prefers-color-scheme: dark)", color: "#12121C" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${fraunces.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen bg-surface-muted antialiased">
        {children}
      </body>
    </html>
  );
}
