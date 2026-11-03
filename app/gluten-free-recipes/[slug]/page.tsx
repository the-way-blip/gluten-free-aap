import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PUBLIC_RECIPES, recipeSlug, findRecipe, cuisineLabel } from "@/lib/recipe-pages";
import { SITE, clip, breadcrumbLd } from "@/lib/seo";
import { GuideCta, JsonLd } from "@/components/GuideCta";
import { RECIPE_IMAGES, pexelsSrc, schemaImages } from "@/lib/recipe-images";

/** Public, server-rendered page for one of Sift's built-in gluten-free recipes. */

export function generateStaticParams() {
  return PUBLIC_RECIPES.map((r) => ({ slug: recipeSlug(r) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = findRecipe(params.slug);
  if (!r) return {};
  const t = `Gluten-Free ${r.title} Recipe`;
  return {
    title: t.length + 7 <= 60 ? `${t} | Sift` : t,
    description: clip(`${r.description} Ready in ${r.time} minutes, serves ${r.servings}.`),
    alternates: { canonical: `${SITE}/gluten-free-recipes/${params.slug}` },
    ...(RECIPE_IMAGES[params.slug]
      ? {
          openGraph: {
            type: "article",
            siteName: "Sift",
            locale: "en_US",
            title: t,
            url: `${SITE}/gluten-free-recipes/${params.slug}`,
            images: [{ url: pexelsSrc(RECIPE_IMAGES[params.slug], 1200, 630), width: 1200, height: 630, alt: RECIPE_IMAGES[params.slug].alt }],
          },
        }
      : {}),
  };
}

export default function RecipePage({ params }: { params: { slug: string } }) {
  const r = findRecipe(params.slug);
  if (!r) notFound();
  const img = RECIPE_IMAGES[params.slug];
  const more = PUBLIC_RECIPES.filter((o) => o.cuisine === r.cuisine && o.id !== r.id).slice(0, 5);

  const ld = [
    breadcrumbLd([
      { name: "Gluten-free recipes", path: "/gluten-free-recipes" },
      { name: r.title, path: `/gluten-free-recipes/${params.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: r.title,
      description: r.description,
      ...(img ? { image: schemaImages(img) } : {}),
      totalTime: `PT${r.time}M`,
      recipeYield: `${r.servings} servings`,
      recipeCuisine: cuisineLabel(r.cuisine),
      ...(r.mealType ? { recipeCategory: r.mealType } : {}),
      keywords: "gluten-free",
      suitableForDiet: "https://schema.org/GlutenFreeDiet",
      recipeIngredient: r.ingredients.map((i) => `${i.quantity} ${i.name}`.trim()),
      recipeInstructions: r.steps.map((s) => ({ "@type": "HowToStep", text: s })),
      author: { "@type": "Organization", name: "Sift" },
    },
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <JsonLd data={ld} />
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        <Link href="/gluten-free-recipes" className="hover:underline">Gluten-free recipes</Link>
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-grain-900">
        Gluten-free {r.title.toLowerCase()}
      </h1>
      {img && (
        <figure className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pexelsSrc(img, 1200, 675)}
            srcSet={`${pexelsSrc(img, 640, 360)} 640w, ${pexelsSrc(img, 1200, 675)} 1200w`}
            sizes="(max-width: 672px) 100vw, 672px"
            width={1200}
            height={675}
            alt={img.alt}
            className="w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-1 text-xs text-gray-400">
            Photo by{" "}
            <a href={img.photographerUrl} className="underline" rel="nofollow noopener" target="_blank">
              {img.photographer}
            </a>{" "}
            on{" "}
            <a href={img.pageUrl} className="underline" rel="nofollow noopener" target="_blank">
              Pexels
            </a>
          </figcaption>
        </figure>
      )}
      <p className="mt-3 leading-relaxed text-gray-700">{r.description}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="chip bg-leaf-50 text-leaf-700">{r.time} min</span>
        <span className="chip bg-grain-100 text-grain-800">Serves {r.servings}</span>
        {r.difficulty && <span className="chip bg-grain-100 text-grain-800">{r.difficulty}</span>}
        {r.dairyFree && <span className="chip bg-leaf-50 text-leaf-700">Dairy-free</span>}
      </div>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">Ingredients</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
        {r.ingredients.map((i, n) => (
          <li key={n}>
            {i.quantity && <span className="font-semibold">{i.quantity} </span>}
            {i.name}
          </li>
        ))}
      </ul>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">Steps</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
        {r.steps.map((s, n) => (
          <li key={n}>{s}</li>
        ))}
      </ol>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">Keeping it gluten-free</h2>
      <p className="mt-2 leading-relaxed text-gray-700">{r.glutenFreeNote}</p>

      <GuideCta text="Save this recipe, scale it, and add the ingredients to your shopping list in Sift." />

      {more.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            More gluten-free {cuisineLabel(r.cuisine).toLowerCase()} recipes
          </h2>
          <ul className="mt-2 space-y-1">
            {more.map((o) => (
              <li key={o.id}>
                <Link href={`/gluten-free-recipes/${recipeSlug(o)}`} className="font-semibold text-leaf-700 underline">
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs leading-relaxed text-gray-400">
        Check the labels on packaged ingredients like broth, sauces and spices.
        Guidance, not medical advice.
      </p>
    </main>
  );
}
