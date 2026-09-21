import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Inter } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
/* Landing page only: a grotesque with character for headlines, a clean sans for copy. */
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-brand", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-copy", display: "swap" });

export const metadata: Metadata = {
  title: "Borderless — your cross-border life, in one place",
  description:
    "Understand what changes for you when you live, study or work across the Netherlands, Germany and Belgium.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bricolage.variable} ${instrument.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
