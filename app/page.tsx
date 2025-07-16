import { ShapeNftViewer } from '@/components/shape-nft-viewer';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col justify-start">
      <ShapeNftViewer />
    </div>
  );
}
