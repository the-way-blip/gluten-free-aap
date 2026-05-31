export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-grain-200 border-t-leaf-600" />
      <span className="text-sm text-grain-400">Loading…</span>
    </div>
  );
}
