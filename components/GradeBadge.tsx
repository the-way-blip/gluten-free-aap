import type { Letter } from "@/lib/types";
import { GRADE_COLORS } from "@/lib/grading";

export function GradeBadge({
  letter,
  size = "md",
}: {
  letter: Letter;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-7 w-7 text-sm",
    md: "h-10 w-10 text-lg",
    lg: "h-14 w-14 text-2xl",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-bold ${GRADE_COLORS[letter]} ${sizes[size]}`}
    >
      {letter}
    </span>
  );
}
