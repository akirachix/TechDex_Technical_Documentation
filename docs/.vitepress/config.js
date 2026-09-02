import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/TechDex_Technical_Documentation/",
  title: "Ishuko Docs",
  description:
    "Technical documentation for the Ishuko maize grading and selling platform",
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: "/logo.png",

    sidebar: [
      {
        text: "Product",
        items: [
          { text: "Overview", link: "/overview" },
          { text: "Architecture", link: "/architecture" },
          { text: "Core Features", link: "/core-features" },
        ],
      },
      {
        text: "Frontend",
        items: [
          { text: "Mobile App (Flutter)", link: "/frontend-mobile" },
          { text: "Admin Web Dashboard (Next.js)", link: "/frontend-web" },
        ],
      },
      {
        text: "Platform",
        items: [
          { text: "Backend (FastAPI)", link: "/backend" },
          { text: "Database", link: "/database" },
          { text: "Security", link: "/security" },
          { text: "AI Quality Assessment Module", link: "/ai-quality-module" },
        ],
      },
      {
        text: "Delivery",
        items: [
          { text: "Quality Assurance & Testing", link: "/quality-assurance" },
          { text: "Rebuild & Deployment Guide", link: "/deployment-guide" },
          { text: "Glossary", link: "/glossary" },
        ],
      },
    ],

    socialLinks: [],

    search: {
      provider: "local",
    },

    footer: {
      message: "Ishuko Technical Documentation",
      copyright: "Prepared by Team TechDex",
    },
  },
});
