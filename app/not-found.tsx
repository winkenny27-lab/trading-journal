import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-5 text-center">
      <TrendingUp size={40} className="text-[#22c55e] mb-6" />
      <h1 className="text-6xl font-extrabold text-[#22c55e] mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-3">Page not found</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-sm">
        Looks like this trade went the wrong way. The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-[#22c55e] text-black font-bold px-6 py-2.5 rounded-xl hover:bg-[#22c55e]/90 transition-colors text-sm"
      >
        <ArrowLeft size={15} />
        Back to Home
      </Link>
    </div>
  );
}
