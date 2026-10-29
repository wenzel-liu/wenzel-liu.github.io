
# Wenhao Liu — personal website

Live site: https://wenzel-liu.github.io/

This is the canonical source repository for the website. GitHub Pages publishes `main` from the repository root. The previous `wenzel-liu/lwh` repository serves redirects from its `pages-redirects` branch, keeping existing article links working.

## Update the website

- React/TypeScript pages and shared design: `app/src/`.
- Article text and metadata: `_content/`; see `_content/README.md`.
- Main navigation: `app/src/content/navigation.ts`.
- Site base: `/` in `app/vite.config.ts`; empty `baseurl` in `_config.yml`.

Run `npm install` for a fresh checkout, then `npm run dev` to preview. Before publishing, run `npm test`, `npm run test:content`, `npx tsc --noEmit -p app/tsconfig.json`, and `npm run test:e2e`. On Node versions with experimental global Web Storage, run unit tests with `NODE_OPTIONS=--no-experimental-webstorage npm test`.

Run `npm run release` and commit the source plus generated root HTML and `app-assets/`. Merge the reviewed change into `main`, wait for the Pages deployment, and verify the public pages and assets. Keep the Jekyll exclusion as `"app/**"`; a plain `app` exclusion also hides `app-assets`.

## Former URLs

`node app/scripts/project-redirects.mjs <output-directory>` generates redirects for all current pages and historical aliases. Their destinations are on the root domain; query strings and section anchors are preserved when JavaScript is enabled. A standard HTML redirect and visible link work without JavaScript. Publish these files to the old repository's `pages-redirects` branch. Keep its existing `assets/` and `app-assets/` files available for shared downloads and cached pages.
