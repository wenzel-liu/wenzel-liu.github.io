# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a hybrid personal academic website combining:
1. **Jekyll static site** (root level) - Academic portfolio with publications, research, and blog
2. **React SPA** (app/ directory) - Modern interactive frontend with dark mode and animations

The site is deployed to GitHub Pages at `https://wenzel-liu.github.io/`.

## Architecture

### Dual Build System

**Jekyll Site (Root)**
- Static site generator for academic content
- Uses Minimal Mistakes theme (remote_theme)
- Content in `_pages/`, `_posts/`, `_data/`
- Layouts in `_layouts/`, includes in `_includes/`
- Configuration: `_config.yml`

**React App (app/)**
- Vite + React 18 + TypeScript
- Framer Motion for animations
- TailwindCSS for styling
- Multi-page SPA with 5 entry points: index, blog, projects, experience, research
- Build output: `app/dist/` → copied to root for deployment

### Key Design Patterns

**Two-Column Layout**
- Left sidebar: Fixed 320px width, sticky positioning
- Right content: flex-grow: 2, scrollable
- Mobile: Single column with hamburger menu

**Dark Mode**
- System preference detection
- Manual toggle with localStorage persistence
- All components support dark mode classes

**Scroll Animations**
- Navbar hides on scroll (200-300px range)
- Card hover effects with Framer Motion
- Smooth transitions throughout

## Development Commands

### Jekyll Site
```bash
# Install Ruby dependencies
bundle install

# Serve locally (port 4000)
bundle exec jekyll serve

# Build static site
bundle exec jekyll build
```

### React App
```bash
# Install Node dependencies
npm install

# Development server (Vite)
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run unit tests (Vitest)
npm test

# Watch mode for tests
npm run test:watch

# E2E tests (Playwright)
npm run test:e2e:install  # First time only
npm run test:e2e
```

### Deployment
```bash
# Build and publish to root
npm run release

# Manual: Build React app, then copy dist/ to root
npm run build
npm run publish:root
```

## File Structure

```
.
├── _config.yml              # Jekyll configuration
├── _pages/                  # Jekyll pages (about, research, etc.)
├── _posts/                  # Blog posts (YYYY-MM-DD-title.md)
├── _layouts/                # Jekyll layouts
├── _includes/               # Jekyll partials
├── _data/                   # YAML data files (navigation, ui-text)
├── assets/                  # Static assets for Jekyll
├── Gemfile                  # Ruby dependencies
├── package.json             # Node dependencies
└── app/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── content/         # Content data
    │   ├── context/         # React context providers
    │   ├── lib/             # Utilities
    │   ├── styles/          # CSS/Tailwind
    │   └── entries/         # Vite entry points
    ├── dist/                # Build output
    ├── vite.config.ts       # Vite configuration
    ├── vitest.config.ts     # Test configuration
    └── playwright.config.ts # E2E test configuration
```

## Content Management

### Adding Blog Posts
1. Create file in `_posts/` with format: `YYYY-MM-DD-title.md`
2. Include front matter:
```yaml
---
layout: single
title: "Post Title"
date: YYYY-MM-DD
categories: [category]
tags: [tag1, tag2]
---
```

### Adding Publications
Edit `_pages/publications.md` following existing format.

### Modifying Navigation
Edit `_data/navigation.yml` for Jekyll site navigation.

### React Content
- Publications data: `app/src/content/publications.ts`
- Presentations data: `app/src/content/presentations.ts`
- Personal info: `app/src/components/MainContent.tsx`

## Configuration

### Jekyll (_config.yml)
- `baseurl: ""` - GitHub Pages subpath
- `remote_theme: "mmistakes/minimal-mistakes@4.27.1"`
- Search disabled to reduce build time
- Pagination: 5 posts per page

### Vite (app/vite.config.ts)
- `base: '/'` - Base path for assets
- Multi-page build with 5 entry points
- Path alias: `@` → `src/`
- Output: `dist/` with assets in `app-assets/`

### TypeScript
- Strict mode enabled
- Path alias configured: `@/*` → `src/*`

## Styling

### Jekyll
- Minimal Mistakes theme with default skin
- Custom SCSS in `_sass/`
- Responsive breakpoints handled by theme

### React
- TailwindCSS utility classes
- Dark mode: `dark:` prefix
- Custom animations via Framer Motion
- Responsive: `sm:`, `md:`, `lg:` breakpoints

## Testing

### Unit Tests (Vitest)
- Test files: `*.test.ts`, `*.test.tsx` in `src/`
- Setup: `src/test/setup.ts`
- Environment: jsdom
- Run with `npm test`

### E2E Tests (Playwright)
- Test files in `app/e2e/`
- Chromium only (configured)
- Run with `npm run test:e2e`

## Deployment Workflow

1. Develop React app: `npm run dev`
2. Test changes: `npm test` and `npm run test:e2e`
3. Build React: `npm run build`
4. Publish to root: `npm run publish:root`
5. Commit both app/dist/ and root files
6. Push to GitHub - Pages auto-deploys from the main branch of wenzel-liu/wenzel-liu.github.io

## Important Notes

- **Base URLs**: Jekyll uses an empty baseurl, React uses `/` - ensure consistency
- **Dark Mode**: Managed by React context, persisted in localStorage
- **Responsive**: Test both desktop (>1024px) and mobile (<640px)
- **Animations**: Framer Motion requires proper key props for list items
- **Build Order**: Always build React before Jekyll for deployment
- **Asset Paths**: React assets go to `app-assets/`, Jekyll to `assets/`

## Common Tasks

**Update personal info**: Edit `_config.yml` (author section) and `app/src/components/MainContent.tsx`

**Change theme**: Modify `minimal_mistakes_skin` in `_config.yml`

**Add new React page**:
1. Create component in `app/src/pages/`
2. Add entry in `app/src/entries/`
3. Update `vite.config.ts` rollupOptions.input
4. Create corresponding HTML in `app/`

**Debug build issues**: Check `app/dist/` output and verify paths match `base` config
