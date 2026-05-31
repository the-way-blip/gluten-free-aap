"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  GFProfile,
  PantryItem,
  PlannedMeal,
  ReactionEntry,
  Recipe,
  ShoppingItem,
} from "./types";

const KEYS = {
  profile: "sift.profile",
  pantry: "sift.pantry",
  shopping: "sift.shopping",
  saved: "sift.savedRecipes",
  plan: "sift.mealPlan",
  reactions: "sift.reactions",
  startTasks: "sift.startTasks",
} as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface SiftState {
  ready: boolean;
  profile: GFProfile | null;
  pantry: PantryItem[];
  shopping: ShoppingItem[];
  saved: Recipe[];

  setProfile: (p: GFProfile) => void;
  clearProfile: () => void;

  addPantryItem: (name: string, location: PantryItem["location"]) => void;
  removePantryItem: (id: string) => void;

  addShoppingItems: (items: Omit<ShoppingItem, "id" | "checked">[]) => void;
  toggleShopping: (id: string) => void;
  removeShopping: (id: string) => void;
  clearCheckedShopping: () => void;
  setShoppingStore: (id: string, store: string | undefined) => void;

  saveRecipe: (r: Recipe) => void;
  unsaveRecipe: (id: string) => void;
  isSaved: (id: string) => boolean;

  mealPlan: PlannedMeal[];
  addToPlan: (day: string, recipe: Recipe) => void;
  removeFromPlan: (id: string) => void;
  clearPlan: () => void;

  reactions: ReactionEntry[];
  addReaction: (entry: Omit<ReactionEntry, "id" | "createdAt">) => void;
  removeReaction: (id: string) => void;

  /** Completed "Start Here" checklist task ids. */
  startTasks: string[];
  toggleStartTask: (id: string) => void;
}

const Ctx = createContext<SiftState | null>(null);

export function SiftProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<GFProfile | null>(null);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [saved, setSaved] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<PlannedMeal[]>([]);
  const [reactions, setReactions] = useState<ReactionEntry[]>([]);
  const [startTasks, setStartTasks] = useState<string[]>([]);

  useEffect(() => {
    const loadAll = () => {
      setProfileState(load<GFProfile | null>(KEYS.profile, null));
      setPantry(load<PantryItem[]>(KEYS.pantry, []));
      setShopping(load<ShoppingItem[]>(KEYS.shopping, []));
      setSaved(load<Recipe[]>(KEYS.saved, []));
      setMealPlan(load<PlannedMeal[]>(KEYS.plan, []));
      setReactions(load<ReactionEntry[]>(KEYS.reactions, []));
      setStartTasks(load<string[]>(KEYS.startTasks, []));
      setReady(true);
    };
    loadAll();
    // CloudSync dispatches this after pulling the user's data from the cloud,
    // so the UI reflects synced state without a page reload.
    window.addEventListener("sift:reload", loadAll);
    return () => window.removeEventListener("sift:reload", loadAll);
  }, []);

  const setProfile = useCallback((p: GFProfile) => {
    setProfileState(p);
    save(KEYS.profile, p);
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    save(KEYS.profile, null);
  }, []);

  const addPantryItem = useCallback(
    (name: string, location: PantryItem["location"]) => {
      setPantry((prev) => {
        const next = [
          { id: uid(), name: name.trim(), location, addedAt: Date.now() },
          ...prev,
        ];
        save(KEYS.pantry, next);
        return next;
      });
    },
    []
  );

  const removePantryItem = useCallback((id: string) => {
    setPantry((prev) => {
      const next = prev.filter((p) => p.id !== id);
      save(KEYS.pantry, next);
      return next;
    });
  }, []);

  const addShoppingItems = useCallback(
    (items: Omit<ShoppingItem, "id" | "checked">[]) => {
      setShopping((prev) => {
        const existing = new Set(
          prev.map((i) => i.name.toLowerCase().trim())
        );
        const toAdd = items
          .filter((i) => !existing.has(i.name.toLowerCase().trim()))
          .map((i) => ({ ...i, id: uid(), checked: false }));
        const next = [...prev, ...toAdd];
        save(KEYS.shopping, next);
        return next;
      });
    },
    []
  );

  const toggleShopping = useCallback((id: string) => {
    setShopping((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      );
      save(KEYS.shopping, next);
      return next;
    });
  }, []);

  const removeShopping = useCallback((id: string) => {
    setShopping((prev) => {
      const next = prev.filter((i) => i.id !== id);
      save(KEYS.shopping, next);
      return next;
    });
  }, []);

  const clearCheckedShopping = useCallback(() => {
    setShopping((prev) => {
      const next = prev.filter((i) => !i.checked);
      save(KEYS.shopping, next);
      return next;
    });
  }, []);

  const setShoppingStore = useCallback(
    (id: string, store: string | undefined) => {
      setShopping((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, store } : i));
        save(KEYS.shopping, next);
        return next;
      });
    },
    []
  );

  const saveRecipe = useCallback((r: Recipe) => {
    setSaved((prev) => {
      if (prev.some((x) => x.id === r.id)) return prev;
      const next = [r, ...prev];
      save(KEYS.saved, next);
      return next;
    });
  }, []);

  const unsaveRecipe = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((x) => x.id !== id);
      save(KEYS.saved, next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => saved.some((x) => x.id === id),
    [saved]
  );

  const addToPlan = useCallback((day: string, recipe: Recipe) => {
    setMealPlan((prev) => {
      const next = [...prev, { id: uid(), day, recipe }];
      save(KEYS.plan, next);
      return next;
    });
  }, []);

  const removeFromPlan = useCallback((id: string) => {
    setMealPlan((prev) => {
      const next = prev.filter((m) => m.id !== id);
      save(KEYS.plan, next);
      return next;
    });
  }, []);

  const clearPlan = useCallback(() => {
    setMealPlan([]);
    save(KEYS.plan, []);
  }, []);

  const addReaction = useCallback(
    (entry: Omit<ReactionEntry, "id" | "createdAt">) => {
      setReactions((prev) => {
        const next = [
          { ...entry, id: uid(), createdAt: Date.now() },
          ...prev,
        ];
        save(KEYS.reactions, next);
        return next;
      });
    },
    []
  );

  const removeReaction = useCallback((id: string) => {
    setReactions((prev) => {
      const next = prev.filter((r) => r.id !== id);
      save(KEYS.reactions, next);
      return next;
    });
  }, []);

  const toggleStartTask = useCallback((id: string) => {
    setStartTasks((prev) => {
      const next = prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id];
      save(KEYS.startTasks, next);
      return next;
    });
  }, []);

  const value: SiftState = {
    ready,
    profile,
    pantry,
    shopping,
    saved,
    setProfile,
    clearProfile,
    addPantryItem,
    removePantryItem,
    addShoppingItems,
    toggleShopping,
    removeShopping,
    clearCheckedShopping,
    setShoppingStore,
    saveRecipe,
    unsaveRecipe,
    isSaved,
    mealPlan,
    addToPlan,
    removeFromPlan,
    clearPlan,
    reactions,
    addReaction,
    removeReaction,
    startTasks,
    toggleStartTask,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSift(): SiftState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSift must be used within SiftProvider");
  return ctx;
}
