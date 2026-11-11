import type { Metadata, Viewport } from "next";
import "./globals.css";
import DeviceLock from "@/components/DeviceLock";
import { LOCK_BOOT_SCRIPT } from "@/lib/deviceLock";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

// Fonts come straight from Google Fonts. globals.css names the families
// directly (--font-display / --font-story / --font-sans), so if this sheet is
// slow or blocked the page falls back to system fonts, never to the browser's
// default serif.
//
// Headings are Bricolage Grotesque. Only 600 and 800 are loaded, so the many
// headings that ask for weight 400 get 600 — bold enough to carry a screen on
// a phone. Fraunces stays as the story voice: story titles and italic lines.
// Orbitron (page titles) and Russo One (section headings, buttons, labels)
// are the Bold look's blocky display faces; body text stays DM Sans.
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2" +
  "?family=Bricolage+Grotesque:wght@600;800" +
  "&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600" +
  "&family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600" +
  "&family=Orbitron:wght@700;900" +
  "&family=Russo+One" +
  "&display=swap";

export const metadata: Metadata = {
  // Each page names itself ("Journal — Groundwork"), so tabs, history and
  // screen readers can tell pages apart (WCAG 2.4.2).
  title: { default: "Groundwork — Figure out who you are", template: "%s — Groundwork" },
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
  // Neon is the default look; the theme boot script swaps this for the
  // chosen look's colour (lib/theme.ts).
  themeColor: "#09061C",
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
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- app router root layout: applies to every page */}
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
        {/* Sets the chosen look (neon / bold / light / dark) before first paint, so
            the page never flashes the wrong colours (lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {/* Hides the page before first paint when this device has a passcode
            and this tab hasn't been unlocked (lib/deviceLock.ts). */}
        <script dangerouslySetInnerHTML={{ __html: LOCK_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-surface-muted antialiased">
        {children}
        <DeviceLock />
      </body>
    </html>
  );
}
