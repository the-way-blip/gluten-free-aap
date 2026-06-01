"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Doodle } from "@/components/Doodle";
import { useSift } from "@/lib/store";
import {
  COMMON_STORES,
  GF_STAPLES,
  STORE_GUIDE,
} from "@/lib/grocery";
import { BRAND_CATEGORIES, GF_BRANDS } from "@/lib/gf-brands";

type View = "list" | "add" | "brands" | "stores";

export default function ShoppingListPage() {
  const {
    shopping,
    addShoppingItems,
    toggleShopping,
    removeShopping,
    clearCheckedShopping,
    setShoppingStore,
  } = useSift();
  const [name, setName] = useState("");
  const [view, setView] = useState<View>("list");
  const [groupByStore, setGroupByStore] = useState(false);
  const [copied, setCopied] = useState(false);

  function add() {
    const v = name.trim();
    if (!v) return;
    addShoppingItems([{ name: v }]);
    setName("");
  }

  // Build a plain-text version of the still-to-buy items, grouped the same way
  // the list is currently grouped, so it pastes cleanly into Notes/Messages.
  function buildListText(): string {
    const lines = ["🛒 My gluten-free shopping list", ""];
    for (const [group, items] of groups.entries()) {
      lines.push(`${group}:`);
      for (const item of items) {
        lines.push(`  • ${item.name}${item.quantity ? ` (${item.quantity})` : ""}`);
      }
      lines.push("");
    }
    lines.push("Made with Sift");
    return lines.join("\n").trim();
  }

  async function shareList() {
    const text = buildListText();
    // Prefer the native share sheet on mobile; fall back to clipboard.
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "My gluten-free shopping list", text });
        return;
      }
    } catch {
      /* user dismissed the share sheet — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing else to do */
    }
  }

  const toBuy = shopping.filter((s) => !s.checked);
  const done = shopping.filter((s) => s.checked);

  // Group "to buy" either by store or by source recipe.
  const groups = useMemo(() => {
    const map = new Map<string, typeof toBuy>();
    for (const item of toBuy) {
      const key = groupByStore
        ? item.store || "Unassigned"
        : item.fromRecipe ?? "Added by you";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [toBuy, groupByStore]);

  const stapleInList = new Set(
    shopping.map((s) => s.name.toLowerCase().trim())
  );

  return (
    <div>
      <Header
        title="Shopping List"
        subtitle={`${toBuy.length} to buy${done.length ? ` · ${done.length} done` : ""}`}
        right={
          done.length > 0 ? (
            <button
              onClick={clearCheckedShopping}
              className="text-sm font-medium text-leaf-600"
            >
              Clear done
            </button>
          ) : undefined
        }
      />

      <div className="px-5 pt-4">
        <div className="mb-4 flex gap-1 rounded-xl bg-grain-100 p-1">
          <Tab active={view === "list"} onClick={() => setView("list")}>
            My list
          </Tab>
          <Tab active={view === "add"} onClick={() => setView("add")}>
            Add GF staples
          </Tab>
          <Tab active={view === "brands"} onClick={() => setView("brands")}>
            GF brands
          </Tab>
          <Tab active={view === "stores"} onClick={() => setView("stores")}>
            Where to shop
          </Tab>
        </div>

        {view === "list" && (
          <div className="space-y-5">
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="Add an item…"
                className="flex-1 rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-grain-900 outline-none focus:border-leaf-500"
              />
              <button onClick={add} className="btn-primary">
                Add
              </button>
            </div>

            {shopping.length > 0 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setGroupByStore((g) => !g)}
                  className="text-sm font-medium text-leaf-600"
                >
                  {groupByStore ? "↩ Group by recipe" : "🏬 Group by store"}
                </button>
                {toBuy.length > 0 && (
                  <button
                    onClick={shareList}
                    className="text-sm font-medium text-leaf-600"
                  >
                    {copied ? "✓ Copied" : "📤 Share list"}
                  </button>
                )}
              </div>
            )}

            {shopping.length === 0 && (
              <div className="card flex flex-col items-center gap-2 py-12 text-center">
                <Doodle name="basket" className="h-14 w-14 text-clay-400" />
                <p className="font-semibold text-grain-900">Your list is empty</p>
                <p className="px-8 text-sm text-gray-500">
                  Add items here, tap “+ to list” on any recipe, or grab some GF
                  staples from the tab above.
                </p>
              </div>
            )}

            {[...groups.entries()].map(([group, items]) => (
              <section key={group}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  {group}
                </h2>
                <div className="card divide-y divide-grain-100">
                  {items.map((item) => (
                    <Row
                      key={item.id}
                      name={item.name}
                      quantity={item.quantity}
                      store={item.store}
                      checked={item.checked}
                      onToggle={() => toggleShopping(item.id)}
                      onRemove={() => removeShopping(item.id)}
                      onStore={(s) => setShoppingStore(item.id, s)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {done.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  In the cart
                </h2>
                <div className="card divide-y divide-grain-100">
                  {done.map((item) => (
                    <Row
                      key={item.id}
                      name={item.name}
                      quantity={item.quantity}
                      store={item.store}
                      checked={item.checked}
                      onToggle={() => toggleShopping(item.id)}
                      onRemove={() => removeShopping(item.id)}
                      onStore={(s) => setShoppingStore(item.id, s)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {view === "add" && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">
              Tap to add naturally gluten-free staples to your list. These are
              whole-food-first to keep costs down.
            </p>
            {GF_STAPLES.map((cat) => (
              <section key={cat.category}>
                <h2 className="mb-2 text-sm font-semibold text-grain-900">
                  {cat.emoji} {cat.category}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((it) => {
                    const added = stapleInList.has(it.toLowerCase().trim());
                    return (
                      <button
                        key={it}
                        disabled={added}
                        onClick={() => addShoppingItems([{ name: it }])}
                        className={`chip border transition ${
                          added
                            ? "border-leaf-200 bg-leaf-50 text-leaf-600"
                            : "border-grain-200 bg-white text-gray-600 hover:bg-grain-50"
                        }`}
                      >
                        {added ? "✓ " : "+ "}
                        {it}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {view === "brands" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Trusted gluten-free product brands — a starting point for what to
              actually buy. Always confirm the label, since lines change.
            </p>
            {BRAND_CATEGORIES.map((cat) => {
              const items = GF_BRANDS.filter((b) => b.category === cat);
              if (items.length === 0) return null;
              return (
                <section key={cat}>
                  <h2 className="mb-2 text-sm font-semibold text-grain-900">
                    {cat}
                  </h2>
                  <div className="card divide-y divide-grain-100">
                    {items.map((b, i) => (
                      <div key={i} className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-grain-900">
                            {b.brand}
                          </span>
                          <span className="text-sm text-gray-500">
                            {b.product}
                          </span>
                          {b.certified && (
                            <span className="chip ml-auto bg-leaf-100 text-leaf-700">
                              Certified GF
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{b.note}</p>
                        <button
                          onClick={() =>
                            addShoppingItems([
                              { name: `${b.brand} ${b.product}` },
                            ])
                          }
                          className="mt-2 text-sm font-semibold text-leaf-600"
                        >
                          + Add to list
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
            <p className="pb-2 text-center text-xs text-gray-400">
              Not sponsored — community-known picks. Certification and recipes
              change, so always read the package.
            </p>
          </div>
        )}

        {view === "stores" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Where gluten-free shoppers tend to get the best selection or value.
              Assign items to a store on your list to plan your trip.
            </p>
            {STORE_GUIDE.map((s) => (
              <div key={s.store} className="card p-4">
                <h3 className="font-semibold text-grain-900">{s.store}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.strength}</p>
              </div>
            ))}
            <p className="pb-2 text-center text-xs text-gray-400">
              Selection varies by location — check your local store's GF section.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
        active ? "bg-white text-grain-900 shadow-sm" : "text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

function Row({
  name,
  quantity,
  store,
  checked,
  onToggle,
  onRemove,
  onStore,
}: {
  name: string;
  quantity?: string;
  store?: string;
  checked: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onStore: (store: string | undefined) => void;
}) {
  const [picking, setPicking] = useState(false);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
            checked
              ? "border-leaf-500 bg-leaf-500 text-white"
              : "border-grain-300 bg-white"
          }`}
          aria-label={checked ? "Mark not bought" : "Mark bought"}
        >
          {checked && "✓"}
        </button>
        <div className="flex-1">
          <span
            className={`text-grain-900 ${
              checked ? "text-gray-400 line-through" : ""
            }`}
          >
            {name}
          </span>
          {quantity && (
            <span className="ml-2 text-sm text-gray-400">{quantity}</span>
          )}
        </div>
        <button
          onClick={() => setPicking((p) => !p)}
          className={`chip border ${
            store
              ? "border-leaf-200 bg-leaf-50 text-leaf-700"
              : "border-grain-200 bg-white text-gray-400"
          }`}
        >
          🏬 {store || "Store"}
        </button>
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-400"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      </div>

      {picking && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-9">
          {COMMON_STORES.map((s) => (
            <button
              key={s}
              onClick={() => {
                onStore(store === s ? undefined : s);
                setPicking(false);
              }}
              className={`chip border transition ${
                store === s
                  ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                  : "border-grain-200 bg-white text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
          {store && (
            <button
              onClick={() => {
                onStore(undefined);
                setPicking(false);
              }}
              className="chip border border-grain-200 bg-white text-gray-400"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
