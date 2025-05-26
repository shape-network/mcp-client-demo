import { Card, CardContent } from '@/components/ui/card';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col gap-4 items-center justify-center min-h-[75dvh]">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl tracking-wide font-semibold mt-2 uppercase">
          dApp Starter
        </h1>
        <h2>A modern & sleek starter kit for building dApps</h2>
      </div>

      <ul className="flex items-center gap-16 mt-4">
        <li>
          <Link
            href="https://github.com/shape-network/dapp-starter"
            className="hover:underline font-semibold flex items-center gap-2"
          >
            Source Code <ArrowTopRightIcon />
          </Link>
        </li>
        <li>
          <Link
            href="https://docs.shape.network"
            className="hover:underline font-semibold flex items-center gap-2"
          >
            Shape Docs <ArrowTopRightIcon />
          </Link>
        </li>
      </ul>
    </main>
  );
}
