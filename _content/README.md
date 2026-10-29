# Article publishing

The articles live in this repository and are published on the existing GitHub Pages site. Reading a page does not call Notion, a database, or a rendering server.

The Blogs page places MedPrism and Sci-Industrialist collections above personal notes. Software such as Focus Reader lives on the separate Projects page.

## Collections

- `medprism/`: biopharma and medical research articles.
- `sci-industrialist/`: technology, manufacturing, institutions, and historical materialism.
- `notes/`: personal notes and everyday life. The Blogs page previews the latest three entries; its Notes & essays heading and "View all" link open the complete collection at `/notes/`.

Each new article is a Markdown file with a short header:

```yaml
---
title: "Article title"
collection: "medprism"
slug: "short-stable-name"
date: "2026-10-29"
lang: "zh-CN"
category: "Biopharma research"
description: "A short description for the article list."
tags: ["Biopharma", "Clinical Research"]
---

## First section

Write the article here.
```

The file's collection must match its folder. Optional `updated` records a substantive update date. The title is rendered by the template, so start body headings at `##`. Store images in `assets/articles/` and reference `/assets/articles/filename.png`.

Use `$...$` for inline equations and `$$...$$` for display equations. Formula layout is produced at build time; no math engine is downloaded by readers. Wide tables scroll within the reading column. Do not change a published slug without adding a redirect.

## Build and review

1. `npm ci`
2. `npm run release` — generates articles and indexes, builds the site, and copies public HTML/assets to the repository root.
3. `NODE_OPTIONS=--no-experimental-webstorage npm test`, `npm run test:content`, and `npm run test:e2e`.
4. Review and commit both source content and generated root HTML/assets before deployment.

`npm run dev` also generates the content before starting. After editing an article while the development server is running, run `npm run content:generate` and reload.

The remaining older `.html` article body is retained for lossless migration. Its `path` metadata preserves the original `posts/*.html` URL. New articles should use Markdown.

The `_content` folder is excluded from GitHub Pages by Jekyll's underscore convention. `app/` is also excluded; only the generated public pages and assets are served. The article list contains metadata, never all article bodies. Static articles reuse the site's React layout during the build, and ship only small navigation and theme controls.

## Import record

`import-receipt.json` records the seven Notion exports and three existing articles with source hashes. Original dates and article bodies were preserved. The one imported image was copied locally and its Markdown reference updated. Rendering repairs the exported multiline formula and duplicated accessible-label/TeX pairs without modifying the source prose. Internal Notion workflow fields (priority, status, editor) are not displayed to readers. Research reports retain their 2025 dates; this migration does not update or re-verify their substantive claims.
