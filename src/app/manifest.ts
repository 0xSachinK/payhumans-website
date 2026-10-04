import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "PayHumans",
    description: SITE.description,
    start_url: "/",
    display: "browser",
    background_color: "#f2f4f0",
    theme_color: "#f2f4f0",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/brand/payhumans-icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/brand/payhumans-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
