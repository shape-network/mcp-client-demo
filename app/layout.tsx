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

            <footer className="border-t py-6 md:py-0">
              <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row">
                <Link
                  href="https://shape.network/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground text-center text-sm leading-loose font-semibold hover:underline md:text-left"
                >
                  shape.network
                </Link>
                <div className="flex items-center gap-4">
                  <Link
                    href="https://x.com/Shape_L2"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="sr-only">Twitter/X</span>
                  </Link>
                  <Link
                    href="http://discord.com/invite/shape-l2"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    <span className="sr-only">Discord</span>
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
