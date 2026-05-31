"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="text-5xl">😕</span>
      <h1 className="text-2xl font-bold text-grain-900">Something went wrong</h1>
      <p className="text-gray-500">
        That's on us. Try again, or head back home.
      </p>
      <button onClick={reset} className="btn-primary mt-2">
        Try again
      </button>
    </div>
  );
}
