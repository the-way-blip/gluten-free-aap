export function Header({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-grain-200/50 bg-[#f7f1e6]/85 px-5 pb-3 pt-6 backdrop-blur">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-grain-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-sage-600">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
