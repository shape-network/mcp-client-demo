import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col gap-4 items-center justify-center min-h-[75dvh]">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold mt-2 uppercase">dApp Starter</h1>
        <h2>A modern & sleek starter kit for building dApps</h2>
      </div>

      <div className="flex flex-col items-start gap-2">
        <ul className="flex flex-col items-start gap-2 list-disc">
          <li>
            <Link href="/" className="hover:underline font-semibold">
              Source Code
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:underline font-semibold">
              Shape Docs
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
