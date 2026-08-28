# Ishuko Docs (VitePress)

Technical documentation site for Ishuko.

## Structure

```
ishuko-docs/
├── package.json
└── docs/
    ├── .vitepress/
    │   └── config.js          # nav tabs + sidebar
    ├── index.md                # home page
    ├── overview.md             # Overview
    ├── core-features.md        # Core Features (new tab)
    ├── frontend-mobile.md      # Frontend — Mobile (Flutter)
    ├── frontend-web.md         # Frontend — Admin Web Dashboard (Next.js)
    ├── backend.md               # Backend (FastAPI)
    ├── database-security.md    # Database & Security
    ├── ai-quality-module.md    # AI Quality Assessment Module
    ├── quality-assurance.md    # QA & Testing
    └── deployment-guide.md     # Rebuild & Deployment Guide (new tab)
```

## Run locally

```bash
npm install
npm run docs:dev
```

Visit the local URL printed in the terminal (usually `http://localhost:5173`).

## Build for production

```bash
npm run docs:build
npm run docs:preview
```

The static site is output to `docs/.vitepress/dist`, which you can deploy to Vercel, Netlify,
GitHub Pages, or any static host.
