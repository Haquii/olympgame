import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Olymp'Game",
    short_name: "Olymp'Game",
    description:
      "Tournois multi-jeux vidéo entre amis — gratuit, fun, configurable.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F8FC",
    theme_color: "#0A1F2E",
    orientation: "portrait-primary",
    categories: ["games", "entertainment", "social"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
