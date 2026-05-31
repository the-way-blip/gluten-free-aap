/**
 * Curated reference of ingredients and label terms, by gluten status.
 * Powers the searchable "Is it gluten-free?" guide and helps people decode
 * confusing packaging. Static data — works with no API key.
 */

export type GlutenStatus = "contains" | "risky" | "usually-safe" | "safe";

export interface GlutenTerm {
  term: string;
  status: GlutenStatus;
  /** Short, plain-English explanation. */
  note: string;
  /** Searchable aliases / related words. */
  aliases?: string[];
}

export const STATUS_META: Record<
  GlutenStatus,
  { label: string; chip: string; dot: string; order: number }
> = {
  contains: {
    label: "Contains gluten",
    chip: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    order: 0,
  },
  risky: {
    label: "Risky — verify",
    chip: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
    order: 1,
  },
  "usually-safe": {
    label: "Usually safe",
    chip: "bg-grain-100 text-grain-700",
    dot: "bg-grain-400",
    order: 2,
  },
  safe: {
    label: "Gluten-free",
    chip: "bg-leaf-100 text-leaf-800",
    dot: "bg-leaf-500",
    order: 3,
  },
};

export const GLUTEN_TERMS: GlutenTerm[] = [
  // ── Contains gluten ──
  { term: "Wheat", status: "contains", note: "The most common gluten grain. Includes white, whole-wheat, and wheat flour.", aliases: ["flour", "wheat flour", "enriched flour"] },
  { term: "Barley", status: "contains", note: "A gluten grain. Often hidden in malt, soups, and beer.", aliases: ["pearl barley"] },
  { term: "Rye", status: "contains", note: "A gluten grain, common in rye bread and some whiskeys (distilled is usually fine).", aliases: [] },
  { term: "Malt", status: "contains", note: "Made from barley. Includes malt extract, malt syrup, malt flavoring, and malt vinegar.", aliases: ["malt extract", "malt syrup", "malt flavoring", "malt vinegar", "malted"] },
  { term: "Brewer's yeast", status: "contains", note: "A byproduct of beer brewing, so it typically contains gluten.", aliases: ["brewers yeast"] },
  { term: "Semolina", status: "contains", note: "Coarse wheat flour used in pasta and couscous.", aliases: ["couscous"] },
  { term: "Durum", status: "contains", note: "A type of wheat used in pasta.", aliases: ["durum wheat"] },
  { term: "Spelt", status: "contains", note: "An ancient form of wheat — still contains gluten.", aliases: ["dinkel"] },
  { term: "Farro", status: "contains", note: "An ancient wheat grain; contains gluten despite the trendy name.", aliases: ["emmer"] },
  { term: "Kamut", status: "contains", note: "An ancient wheat variety — contains gluten.", aliases: ["khorasan wheat"] },
  { term: "Triticale", status: "contains", note: "A hybrid of wheat and rye. Contains gluten.", aliases: [] },
  { term: "Seitan", status: "contains", note: "Made from wheat gluten — it's essentially pure gluten. Avoid entirely.", aliases: ["wheat meat", "wheat gluten", "vital wheat gluten"] },
  { term: "Graham flour", status: "contains", note: "A type of wheat flour used in graham crackers.", aliases: ["graham"] },
  { term: "Bulgur", status: "contains", note: "A cracked wheat used in tabbouleh.", aliases: [] },
  { term: "Panko", status: "contains", note: "Japanese breadcrumbs made from wheat.", aliases: ["breadcrumbs", "bread crumbs"] },
  { term: "Soy sauce", status: "contains", note: "Most soy sauce is brewed with wheat. Use tamari labeled gluten-free instead.", aliases: ["shoyu"] },

  // ── Risky — verify ──
  { term: "Oats", status: "risky", note: "Naturally gluten-free but very often cross-contaminated with wheat. Buy certified gluten-free oats.", aliases: ["oatmeal", "oat flour"] },
  { term: "Natural flavors", status: "risky", note: "Usually fine, but can occasionally derive from barley/wheat. Verify if you're sensitive.", aliases: ["natural flavoring", "artificial flavors"] },
  { term: "Modified food starch", status: "risky", note: "Safe when from corn/potato, but can be wheat-based. In the US, wheat must be labeled.", aliases: ["food starch"] },
  { term: "Dextrin", status: "risky", note: "Can be derived from wheat. Maltodextrin is different and usually safe.", aliases: [] },
  { term: "Hydrolyzed vegetable protein", status: "risky", note: "May be derived from wheat. Check the source.", aliases: ["hvp", "hydrolyzed protein"] },
  { term: "Soy sauce / teriyaki", status: "risky", note: "Standard versions contain wheat; gluten-free versions exist.", aliases: ["teriyaki"] },
  { term: "Beer", status: "risky", note: "Standard beer contains barley. Look for dedicated gluten-free beer (not just 'gluten-removed' if celiac).", aliases: ["lager", "ale"] },
  { term: "Licorice", status: "risky", note: "Traditional licorice candy usually contains wheat flour.", aliases: ["liquorice"] },
  { term: "Imitation crab", status: "risky", note: "Surimi often contains wheat starch as a binder.", aliases: ["surimi", "krab"] },
  { term: "Communion wafer", status: "risky", note: "Typically wheat; low-gluten options exist for celiacs.", aliases: [] },
  { term: "Gravy", status: "risky", note: "Usually thickened with wheat flour. Ask or check the label.", aliases: ["roux"] },
  { term: "Broth / bouillon", status: "risky", note: "Some contain wheat or barley. Verify the brand.", aliases: ["stock", "bouillon"] },

  // ── Usually safe ──
  { term: "Maltodextrin", status: "usually-safe", note: "Despite the name, it's almost always made from corn and is gluten-free, even when from wheat (highly processed).", aliases: [] },
  { term: "Caramel color", status: "usually-safe", note: "In North America it's made from corn and is gluten-free.", aliases: ["caramel coloring"] },
  { term: "Glucose syrup", status: "usually-safe", note: "Even wheat-derived glucose syrup is processed enough to be gluten-free.", aliases: ["glucose"] },
  { term: "Distilled vinegar", status: "usually-safe", note: "Distillation removes gluten — safe even if grain-derived. (Malt vinegar is the exception — avoid it.)", aliases: ["white vinegar"] },
  { term: "Distilled spirits", status: "usually-safe", note: "Distillation removes gluten, so most whiskey/vodka is fine even from grain.", aliases: ["whiskey", "vodka", "liquor"] },
  { term: "Citric acid", status: "usually-safe", note: "Typically derived from corn or fermentation — gluten-free.", aliases: [] },
  { term: "Vanilla extract", status: "usually-safe", note: "Alcohol-based and gluten-free; imitation versions are fine too.", aliases: ["vanilla"] },
  { term: "Mono- and diglycerides", status: "usually-safe", note: "Fat-based emulsifiers — gluten-free.", aliases: ["diglycerides"] },

  // ── Naturally gluten-free ──
  { term: "Rice", status: "safe", note: "All plain rice — white, brown, wild, jasmine, basmati — is gluten-free.", aliases: ["white rice", "brown rice", "jasmine rice", "basmati"] },
  { term: "Corn", status: "safe", note: "Corn and plain cornmeal/masa are gluten-free (watch for wheat in corn-blend tortillas).", aliases: ["maize", "cornmeal", "masa", "polenta"] },
  { term: "Potato", status: "safe", note: "Potatoes and potato starch are gluten-free.", aliases: ["potato starch"] },
  { term: "Quinoa", status: "safe", note: "A naturally gluten-free seed — great rice/grain substitute.", aliases: [] },
  { term: "Buckwheat", status: "safe", note: "Despite the name, buckwheat is gluten-free and unrelated to wheat.", aliases: ["soba (100%)"] },
  { term: "Almond flour", status: "safe", note: "Made from ground almonds — gluten-free.", aliases: ["almond meal"] },
  { term: "Coconut flour", status: "safe", note: "Gluten-free and popular in GF baking.", aliases: [] },
  { term: "Tapioca", status: "safe", note: "From cassava — gluten-free, common in GF flour blends.", aliases: ["tapioca starch", "cassava"] },
  { term: "Chickpea flour", status: "safe", note: "Made from ground chickpeas — gluten-free.", aliases: ["besan", "gram flour", "garbanzo flour"] },
  { term: "Tamari", status: "safe", note: "A soy sauce alternative — choose bottles labeled gluten-free.", aliases: [] },
  { term: "Millet", status: "safe", note: "A naturally gluten-free ancient grain.", aliases: [] },
  { term: "Sorghum", status: "safe", note: "Gluten-free grain often used in GF flour blends.", aliases: [] },
  { term: "Amaranth", status: "safe", note: "A gluten-free seed/grain.", aliases: [] },
  { term: "Eggs", status: "safe", note: "Plain eggs are naturally gluten-free.", aliases: [] },
  { term: "Plain meat & fish", status: "safe", note: "Unprocessed, unmarinated meat, poultry, and seafood are gluten-free.", aliases: ["chicken", "beef", "fish", "pork"] },
  { term: "Fresh fruits & vegetables", status: "safe", note: "All plain fruits and vegetables are naturally gluten-free.", aliases: ["produce"] },
  { term: "Most dairy", status: "safe", note: "Plain milk, butter, and most cheeses are gluten-free (flavored/processed ones can vary).", aliases: ["milk", "butter", "cheese"] },

  // ── Additional contains-gluten sources ──
  { term: "Couscous", status: "contains", note: "Made from semolina wheat — not a gluten-free grain despite looking like one.", aliases: ["pearl couscous", "israeli couscous"] },
  { term: "Orzo", status: "contains", note: "A rice-shaped pasta made from wheat. GF orzo exists but standard is wheat.", aliases: [] },
  { term: "Matzo", status: "contains", note: "Traditional matzo is wheat. GF matzo (from oat/tapioca) is sold separately.", aliases: ["matzah", "matzoh"] },
  { term: "Einkorn", status: "contains", note: "An ancient wheat — still contains gluten.", aliases: [] },
  { term: "Wheat starch", status: "contains", note: "Avoid unless specifically labeled gluten-free wheat starch (processed below 20ppm).", aliases: [] },
  { term: "Malt vinegar", status: "contains", note: "Made from barley and NOT distilled — contains gluten (unlike distilled vinegar).", aliases: [] },
  { term: "Beer batter", status: "contains", note: "Made with regular beer and flour — fried foods in beer batter are off-limits.", aliases: ["tempura"] },
  { term: "Roux", status: "contains", note: "A flour-and-fat thickener in many sauces, gumbo, and gravies.", aliases: [] },
  { term: "Croutons", status: "contains", note: "Toasted bread cubes — keep them off salads.", aliases: [] },
  { term: "Panko", status: "contains", note: "Japanese wheat breadcrumbs (already listed) — also hides on fried/'crusted' items.", aliases: ["breading"] },
  { term: "Udon", status: "contains", note: "Thick wheat noodles. Rice noodles and GF noodles are safe alternatives.", aliases: [] },
  { term: "Ramen (instant)", status: "contains", note: "Standard ramen/instant noodles are wheat. Rice/GF ramen exists.", aliases: ["instant noodles"] },
  { term: "Seitan / wheat gluten", status: "contains", note: "Pure wheat gluten — common in mock meats. Avoid entirely.", aliases: ["vital wheat gluten", "wheat protein"] },
  { term: "Graham crackers", status: "contains", note: "Made from graham (wheat) flour — also in pie crusts and s'mores.", aliases: [] },
  { term: "Pretzels", status: "contains", note: "Wheat-based; GF pretzels are a separate product.", aliases: [] },
  { term: "Flour tortilla", status: "contains", note: "Wheat. Use corn tortillas (verify they're 100% corn).", aliases: [] },
  { term: "Hoisin sauce", status: "contains", note: "Typically thickened with wheat. Look for a GF hoisin.", aliases: [] },
  { term: "Oyster sauce", status: "contains", note: "Usually contains wheat. GF versions exist.", aliases: [] },
  { term: "Teriyaki sauce", status: "contains", note: "Soy-sauce based, so usually wheat. Use GF teriyaki.", aliases: [] },
  { term: "Miso (barley)", status: "contains", note: "Barley miso (mugi miso) contains gluten. Rice miso is usually GF — check.", aliases: ["mugi miso"] },
  { term: "Bouillon cubes", status: "risky", note: "Many contain wheat or barley. Verify GF on the label.", aliases: ["stock cubes"] },
  { term: "Soy sauce packets", status: "contains", note: "Takeout soy sauce is wheat-brewed — carry your own GF tamari.", aliases: [] },

  // ── Additional risky / verify ──
  { term: "Modified food starch", status: "risky", note: "Usually corn, but can be wheat. In the US, wheat source must be declared.", aliases: ["food starch"] },
  { term: "Seasoning blends", status: "risky", note: "Spice mixes and rubs can use wheat flour as an anti-caking carrier. Check labels.", aliases: ["spice mix", "rub"] },
  { term: "Soy protein", status: "risky", note: "Hydrolyzed/textured soy protein can be processed with wheat. Verify.", aliases: ["tvp", "textured vegetable protein"] },
  { term: "Caramel coloring (imported)", status: "risky", note: "GF in North America; some imported products may use barley-derived. Usually fine.", aliases: [] },
  { term: "Flavored coffee/tea", status: "risky", note: "Some flavorings and barley-based blends contain gluten. Plain coffee/tea is safe.", aliases: [] },
  { term: "Processed cheese", status: "risky", note: "Shredded/processed cheeses sometimes use wheat-based anti-caking agents. Block cheese is safest.", aliases: ["shredded cheese"] },
  { term: "Veggie burgers", status: "risky", note: "Many contain wheat/seitan as a binder. Look for certified-GF patties.", aliases: [] },
  { term: "Energy/protein bars", status: "risky", note: "Frequently contain oats or wheat. Choose certified-GF bars.", aliases: ["protein bar"] },
  { term: "Ice cream (mix-ins)", status: "risky", note: "Base is usually GF, but cookie dough, brownie, and cone pieces aren't.", aliases: [] },
  { term: "Marinades & dressings", status: "risky", note: "Can contain soy sauce, malt, or thickeners. Verify each one.", aliases: ["salad dressing"] },
  { term: "Play-Doh / craft dough", status: "risky", note: "Contains wheat — a real concern for kids (hand-to-mouth). Not food, but worth knowing.", aliases: ["playdough"] },
  { term: "Lipstick / lip balm", status: "risky", note: "Some contain wheat derivatives; matters because it's ingested. Check if sensitive.", aliases: ["chapstick"] },
  { term: "Medications & supplements", status: "risky", note: "Pills can use wheat starch as a binder and aren't always labeled. Ask your pharmacist.", aliases: ["pills", "vitamins"] },
  { term: "Communion wafers", status: "contains", note: "Traditional wafers are wheat; low-gluten options exist for celiacs.", aliases: [] },
  { term: "Soba noodles", status: "risky", note: "Often a buckwheat-WHEAT blend. Only 100% buckwheat soba is GF.", aliases: [] },
  { term: "Rice pilaf / rice mixes", status: "risky", note: "Boxed rice blends sometimes include orzo or wheat seasoning. Plain rice is safe.", aliases: [] },

  // ── Additional usually-safe (de-mystify scary names) ──
  { term: "Lecithin", status: "usually-safe", note: "Soy or sunflower lecithin is gluten-free.", aliases: ["soy lecithin"] },
  { term: "Xanthan gum", status: "usually-safe", note: "A common GF-baking binder — gluten-free.", aliases: [] },
  { term: "Guar gum", status: "usually-safe", note: "From a legume — gluten-free.", aliases: [] },
  { term: "Cornstarch", status: "usually-safe", note: "From corn — gluten-free and a great thickener.", aliases: ["corn starch"] },
  { term: "Annatto", status: "usually-safe", note: "A natural plant-based color — gluten-free.", aliases: [] },
  { term: "MSG", status: "usually-safe", note: "Monosodium glutamate is gluten-free despite the 'glut' in the name.", aliases: ["monosodium glutamate"] },
  { term: "Yeast (baker's/nutritional)", status: "usually-safe", note: "Baker's and nutritional yeast are GF — only BREWER'S yeast is a concern.", aliases: ["nutritional yeast", "active dry yeast"] },
  { term: "Vinegar (white/apple cider/balsamic)", status: "usually-safe", note: "Distilled and fruit vinegars are GF. Only MALT vinegar contains gluten.", aliases: ["apple cider vinegar", "balsamic"] },
  { term: "Rice syrup", status: "usually-safe", note: "Brown rice syrup is GF (older 'barley enzyme' concern is largely outdated — verify if very sensitive).", aliases: ["brown rice syrup"] },
  { term: "Wine", status: "usually-safe", note: "Wine is naturally gluten-free.", aliases: [] },
  { term: "Cider & most spirits", status: "usually-safe", note: "Hard cider and distilled spirits (vodka, whiskey, rum, gin) are GF even from grain — distillation removes gluten.", aliases: ["hard cider"] },

  // ── Additional naturally gluten-free foods ──
  { term: "Lentils", status: "safe", note: "All lentils are naturally gluten-free.", aliases: [] },
  { term: "Chickpeas", status: "safe", note: "Naturally gluten-free; chickpea flour is a great swap.", aliases: ["garbanzo"] },
  { term: "Beans", status: "safe", note: "All plain dried/canned beans are gluten-free (check seasoned/baked beans).", aliases: ["black beans", "pinto", "kidney beans"] },
  { term: "Nuts & seeds (plain)", status: "safe", note: "Plain nuts and seeds are gluten-free (watch flavored/coated ones).", aliases: ["almonds", "walnuts", "cashews"] },
  { term: "Cassava / yuca", status: "safe", note: "Naturally gluten-free root; cassava flour is popular in GF baking.", aliases: ["yuca", "manioc"] },
  { term: "Plantains", status: "safe", note: "Naturally gluten-free; plantain chips are a good snack (check frying).", aliases: [] },
  { term: "Polenta / grits", status: "safe", note: "Plain corn polenta and grits are gluten-free (avoid wheat-added instant blends).", aliases: ["grits"] },
  { term: "Coconut (flour/milk/oil)", status: "safe", note: "All plain coconut products are gluten-free and dairy-free.", aliases: ["coconut flour", "coconut milk"] },
  { term: "Arrowroot", status: "safe", note: "A gluten-free starch/thickener from a root.", aliases: [] },
  { term: "Teff", status: "safe", note: "A tiny gluten-free ancient grain (used in injera — but check restaurant injera isn't wheat-blended).", aliases: [] },
];

/** Filter the reference by a free-text query against term + aliases + note. */
export function searchTerms(query: string): GlutenTerm[] {
  const q = query.toLowerCase().trim();
  const sorted = [...GLUTEN_TERMS].sort(
    (a, b) =>
      STATUS_META[a.status].order - STATUS_META[b.status].order ||
      a.term.localeCompare(b.term)
  );
  if (!q) return sorted;
  return sorted.filter((t) => {
    if (t.term.toLowerCase().includes(q)) return true;
    if (t.note.toLowerCase().includes(q)) return true;
    return (t.aliases ?? []).some((a) => a.toLowerCase().includes(q));
  });
}
