import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dApp Starter - Shape",
  description: "A modern & sleek starter kit for building dApps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="bg-background min-h-screen font-[family-name:var(--font-geist-sans)]">
            <header className="border-b">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/shape_logo_black.svg"
                    alt="Shape Logo"
                    width={100}
                    height={40}
                    priority
                  />
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <WalletConnect />
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
