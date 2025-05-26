import { Providers } from '@/components/providers';
import { WalletConnect } from '@/components/wallet-connect';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'dApp Starter - Shape',
  description: 'A modern & sleek starter kit for building dApps',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid grid-rows-[1fr,auto] items-center p-5 font-[family-name:var(--font-geist-sans)]">
            <header className="flex flex-col items-start gap-4 ">
              <Link href="/">
                <Image
                  src="/shape_logo_black.svg"
                  alt="Shape Logo"
                  width={100}
                  height={100}
                />
              </Link>
              <WalletConnect />
            </header>

            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
