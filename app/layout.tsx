import type { ReactNode } from "react";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { themeInitScript } from "@/components/layout/theme-script";

import "./globals.css";

/* Fonts: defined in globals.css (--font-body, --font-code) so Docker/offline builds
   never call fonts.googleapis.com. next/font/google fetches at compile time and fails
   when the container has no DNS/route to Google. */

export const metadata: Metadata = {
  title: {
    default: "The Software Story",
    template: "%s | The Software Story",
  },
  description:
    "The Software Story: home of AI Agent Story by Youssef Fathy, covering LLMs, tools, agents, and production systems from the ground up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
