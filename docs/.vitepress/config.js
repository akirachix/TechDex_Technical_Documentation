import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Ishuko Docs",
  description:
    "Technical documentation for the Ishuko maize grading and selling platform",
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: "/logo.png",

    nav: [
      { text: "Overview", link: "/overview" },
      { text: "Core Features", link: "/core-features" },
      { text: "Mobile", link: "/frontend-mobile" },
      { text: "Web Dashboard", link: "/frontend-web" },
      { text: "Backend", link: "/backend" },
      { text: "Database & Security", link: "/database-security" },
      { text: "AI Module", link: "/ai-quality-module" },
      { text: "QA & Testing", link: "/quality-assurance" },
      { text: "Rebuild / Deploy", link: "/deployment-guide" },
      { text: "Glossary", link: "/glossary" },
    ],

    sidebar: [
      {
        text: "Product",
        items: [
          { text: "Overview", link: "/overview" },
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
          { text: "Database & Security", link: "/database-security" },
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
