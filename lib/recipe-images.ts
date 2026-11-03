/**
 * Hand-picked Pexels photos for the public recipe pages, keyed by recipe slug.
 * Each was chosen as a close match for the finished dish with nothing that
 * contains gluten in frame. Recipes without a close match have no entry and
 * render without a photo. Free to use under the Pexels license; credited on
 * the page as Pexels asks.
 */

export type RecipeImage = {
  /** Pexels photo id. */
  id: number;
  /** What the photo shows (alt text). */
  alt: string;
  photographer: string;
  photographerUrl: string;
  /** The photo's page on Pexels. */
  pageUrl: string;
  /** Original image URL on images.pexels.com (sizing params get appended). */
  original: string;
};

export const RECIPE_IMAGES: Record<string, RecipeImage> = {};

/** A cropped, compressed rendition of the photo at an exact size. */
export function pexelsSrc(img: RecipeImage, w: number, h: number): string {
  return `${img.original}?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;
}

/** 1x1, 4x3 and 16x9 renditions, as Google recommends for Recipe markup. */
export function schemaImages(img: RecipeImage): string[] {
  return [pexelsSrc(img, 1200, 1200), pexelsSrc(img, 1200, 900), pexelsSrc(img, 1200, 675)];
}
