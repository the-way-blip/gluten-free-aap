"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSift } from "@/lib/store";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/recipes", label: "Recipes", icon: BookIcon },
  { href: "/pantry", label: "Pantry", icon: FridgeIcon },
  { href: "/restaurants", label: "Dining", icon: ForkIcon },
  { href: "/shopping-list", label: "List", icon: CartIcon },
];

export function Nav() {
  const pathname = usePathname();
  const { profile, ready } = useSift();

  // Hide nav during onboarding or before a profile exists.
  if (!ready) return null;
  if (pathname?.startsWith("/onboarding")) return null;
  if (!profile) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md">
        <div className="m-3 flex items-center justify-around rounded-[1.4rem] border border-grain-200/60 bg-[#fbf7ef]/95 p-1.5 shadow-soft backdrop-blur">
          {TABS.map((t) => {
            const active =
              t.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-semibold transition ${
                  active
                    ? "bg-leaf-100 text-leaf-700"
                    : "text-sage-500 hover:text-sage-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function BookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z" /><path d="M18 4h2v16" />
    </svg>
  );
}
function FridgeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="2" /><path d="M6 10h12" /><path d="M9 6v1" /><path d="M9 14v2" />
    </svg>
  );
}
function ForkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a2 2 0 0 0 4 0V3" /><path d="M8 10v11" /><path d="M16 3c-1.5 0-3 1.5-3 4s1.5 4 3 4" /><path d="M16 3v18" />
    </svg>
  );
}
function CartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M2 3h2l2.5 13h11L21 7H6" />
    </svg>
  );
}
