# Finzytrack Documentation

Documentation site for [Finzytrack](https://github.com/sagarbehere/finzytrack), an open-source personal finance application.

Built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/). Hosted at [docs.finzytrack.com](https://docs.finzytrack.com).

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start local dev server at localhost:4322
npm run build        # Build production site to ./dist/
npm run preview      # Preview built site locally
```

## Structure

Documentation pages live in `src/content/docs/` as Markdown (`.md`) or MDX (`.mdx`) files. Each file is exposed as a route based on its file name.

```
src/content/docs/
├── index.md                  # Homepage
├── installation.md           # Installation guide
├── quick-start.md            # Quick start guide
├── faq.md                    # Frequently asked questions
├── views/                    # UI view documentation
│   ├── dashboards.md
│   ├── import.md
│   ├── transactions.md
│   ├── accounts.md
│   ├── query.md
│   └── ai-assistant.md
├── reference/                # Technical reference
│   ├── dashboard-recipes.md
│   ├── querying-data.md
│   ├── file-import-rules.md
│   ├── email-import-rules.md
│   ├── configuration.md
│   ├── account-hierarchy.mdx
│   ├── ai-data-sharing.md
│   ├── auto-categorization.md
│   └── backups-and-logs.md
└── development/              # Developer documentation
    ├── architecture.md
    ├── building.md
    └── contributing.md
```

## Contributing

See the [Contributing](https://docs.finzytrack.com/development/contributing/) page for details on how to contribute to the documentation.
