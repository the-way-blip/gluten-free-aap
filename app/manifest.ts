import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sift — Eat gluten-free with confidence",
    short_name: "Sift",
    description:
      "Personalized gluten-free recipes, pantry meal ideas, smart shopping lists, restaurant grades, and a label checker — tuned to how strict you need to be.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#368856",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
