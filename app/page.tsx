import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[75dvh] flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <h1 className="mt-2 text-4xl font-semibold tracking-wide uppercase">
          dApp Starter
        </h1>
        <h2>A modern & sleek starter kit for building dApps</h2>
      </div>

      <ul className="mt-4 flex items-center gap-16">
        <li>
          <Link
            href="https://github.com/shape-network/dapp-starter"
            className="flex items-center gap-2 font-semibold hover:underline"
          >
            Source Code <ArrowTopRightIcon />
          </Link>
        </li>
        <li>
          <Link
            href="https://docs.shape.network"
            className="flex items-center gap-2 font-semibold hover:underline"
          >
            Shape Docs <ArrowTopRightIcon />
          </Link>
        </li>
      </ul>
    </main>
  );
}
