import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://olympgame.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/tournois`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/creer`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/profil`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
