import Link from "next/link";

export default function Logo({ className = "" }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 text-base font-black text-white shadow-md shadow-indigo-500/30 transition group-hover:rotate-6">
        S
      </span>
      <span className="text-lg font-extrabold tracking-tight text-gray-900">
        Shop<span className="text-indigo-600">io</span>
      </span>
    </Link>
  );
}
