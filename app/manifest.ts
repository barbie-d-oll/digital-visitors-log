import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Visitor Log",
    short_name: "Visitor Log",
    description:
      "A simple, secure, and welcoming way to manage every visitor.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#1b6b61",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Check in visitor",
        short_name: "Check in",
        description: "Open the visitor registration form.",
        url: "/register",
        icons: [
          {
            src: "/icon",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      {
        name: "Visitor sign out",
        short_name: "Sign out",
        description: "Open the visitor logout form.",
        url: "/logout",
        icons: [
          {
            src: "/icon",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
