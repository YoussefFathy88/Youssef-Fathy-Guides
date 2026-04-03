import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-code",
});

export const metadata: Metadata = {
  title: {
    default: "The Software Story",
    template: "%s | The Software Story",
  },
  description:
    "The Software Story: home of The Agents Story playlist by Youssef Fathy, covering LLMs, tools, agents, and production systems from the ground up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={cn(
          inter.variable,
          jetbrainsMono.variable,
          "min-h-screen bg-background text-foreground",
        )}
      >
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
