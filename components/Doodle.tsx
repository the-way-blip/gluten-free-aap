/**
 * Hand-drawn, sketchy spot illustrations for a warm cottage-farm feel.
 * Pure inline SVG (no assets) with slightly irregular strokes so they read
 * as illustrated rather than geometric. Use in empty states & section headers.
 */

type DoodleName =
  | "sprout"
  | "carrot"
  | "wheat"
  | "bowl"
  | "basket"
  | "leaf";

const STROKE = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Doodle({
  name,
  className = "h-12 w-12",
}: {
  name: DoodleName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden {...STROKE}>
      {PATHS[name]}
    </svg>
  );
}

const PATHS: Record<DoodleName, React.ReactNode> = {
  sprout: (
    <>
      <path d="M24 42V20" />
      <path d="M24 24c-7 0-12-4-13-11 7-1 12 3 13 11z" />
      <path d="M24 20c5 0 9-3 10-9-5-1-9 2-10 9z" />
    </>
  ),
  carrot: (
    <>
      <path d="M16 18l14 14c-3 6-9 10-14 8s-6-9 0-14z" transform="rotate(8 24 26)" />
      <path d="M30 16l4-6M32 18l7-3M28 14l1-7" />
    </>
  ),
  wheat: (
    <>
      <path d="M24 44V16" />
      <path d="M24 16c0-5 3-9 3-13-4 1-7 4-6 8M24 16c0-5-3-9-3-13 4 1 7 4 6 8" />
      <path d="M24 24c4-1 7-4 8-8-4 0-7 2-8 5M24 24c-4-1-7-4-8-8 4 0 7 2 8 5" />
      <path d="M24 32c4-1 7-4 8-8-4 0-7 2-8 5M24 32c-4-1-7-4-8-8 4 0 7 2 8 5" />
    </>
  ),
  bowl: (
    <>
      <path d="M6 22h36c0 9-8 16-18 16S6 31 6 22z" />
      <path d="M16 22c1-5 5-8 8-8s7 3 8 8" />
      <path d="M2 22h44" />
    </>
  ),
  basket: (
    <>
      <path d="M8 22h32l-3 16a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z" />
      <path d="M14 22l8-12M34 22l-8-12" />
      <path d="M6 22h36" />
      <path d="M19 28v8M29 28v8" />
    </>
  ),
  leaf: (
    <>
      <path d="M10 38C10 20 24 8 40 8c0 18-14 30-30 30z" />
      <path d="M10 38C18 30 28 22 38 12" />
    </>
  ),
};
