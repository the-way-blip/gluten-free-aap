import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="text-5xl">🌾</span>
      <h1 className="text-2xl font-bold text-grain-900">Page not found</h1>
      <p className="text-gray-500">
        We couldn't find that page. Let's get you back to something useful.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Back to home
      </Link>
    </div>
  );
}
