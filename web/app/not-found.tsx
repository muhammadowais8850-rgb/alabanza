import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[700px] px-4 py-24 text-center">
      <h1 className="mb-4 text-[48px] font-bold">404</h1>
      <p className="mb-8">The page you were looking for does not exist.</p>
      <Link href="/" className="inline-flex h-[46px] items-center rounded-lg bg-black px-8 font-medium text-white">Continue shopping</Link>
    </div>
  );
}
