"use client";

/**
 * Cottage-farm flavored loading skeletons. Shown while the AI is "thinking"
 * so the wait feels intentional and the layout doesn't jump when results land.
 * All use Tailwind's animate-pulse with the cream/grain palette.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded-full bg-grain-100 ${className}`} />;
}

/** Placeholder shaped like a RecipeCard's collapsed header. */
export function RecipeCardSkeleton() {
  return (
    <div className="card animate-pulse p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2.5">
          <Bar className="h-4 w-2/3" />
          <Bar className="h-3 w-1/3 bg-grain-50" />
          <div className="flex gap-1.5 pt-1">
            <Bar className="h-5 w-16" />
            <Bar className="h-5 w-12" />
          </div>
        </div>
        <Bar className="h-8 w-8 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

/** Placeholder shaped like a RestaurantCard's collapsed header. */
export function RestaurantCardSkeleton() {
  return (
    <div className="card animate-pulse p-4">
      <div className="flex items-center gap-3">
        <Bar className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Bar className="h-4 w-1/2" />
          <Bar className="h-3 w-1/3 bg-grain-50" />
        </div>
        <Bar className="h-9 w-9 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

/** A short caption that cycles a gentle cooking/searching message. */
export function SkeletonCaption({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-grain-200 border-t-leaf-600" />
      {children}
    </div>
  );
}

/** Stack of N card skeletons with a caption. */
export function RecipeSkeletonList({
  count = 3,
  caption = "Cooking up ideas…",
}: {
  count?: number;
  caption?: string;
}) {
  return (
    <div className="space-y-3">
      <SkeletonCaption>{caption}</SkeletonCaption>
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}
