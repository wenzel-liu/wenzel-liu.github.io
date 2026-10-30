# Wenhao Liu — 个人主页 / Personal website

[访问网站 / Visit website](https://wenzel-liu.github.io/) · [完整 PR 更新记录 / Full PR changelog](CHANGELOG.md)

这是 Wenhao Liu 个人网站的主仓库，收录个人经历、研究与报告、独立项目，以及 MedPrism、Sci-Industrialist 和 Notes & essays 三个文章栏目。GitHub Pages 从 `main` 分支的根目录发布网站，旧的 `/lwh/` 地址继续提供跳转。

Wenhao Liu’s personal website brings together professional experience, papers and talks, independent projects, and writing in MedPrism, Sci-Industrialist, and Notes & essays.

This is the canonical source repository for the website. GitHub Pages publishes `main` from the repository root. The previous `wenzel-liu/lwh` repository serves redirects from its `pages-redirects` branch, keeping existing article links working.

## 近期 PR 更新 / Recent PR updates

以下为当前仓库的已合并更新，日期使用日本时间（JST）。迁移前 `wenzel-liu/lwh` 仓库的 6 个 PR 也收录在[完整更新记录](CHANGELOG.md)中；两个仓库的 PR 编号分别计数。

These are merged updates in the current repository, dated in Japan Standard Time (JST). The [full changelog](CHANGELOG.md) also covers the six PRs in the former `wenzel-liu/lwh` repository. PR numbers are scoped to their own repository.

| 合并日期 / Merged | PR | 中文摘要 | English summary |
| --- | --- | --- | --- |
| 2026-10-30 | [#4](https://github.com/wenzel-liu/wenzel-liu.github.io/pull/4) | 新增全站与栏目内搜索；修复点击跳转，并自动定位到文章标题或对应列表条目。 | Added global and collection search, reliable result navigation, and automatic positioning at article titles or matching entries. |
| 2026-10-29 | [#3](https://github.com/wenzel-liu/wenzel-liu.github.io/pull/3) | 新增公开随笔、独立 Notes 栏目与栏目图标，清理旧示例文章。 | Added public journal entries, a dedicated Notes collection, and collection branding; removed old sample posts. |
| 2026-10-29 | [#2](https://github.com/wenzel-liu/wenzel-liu.github.io/pull/2) | 统一使用 Blogs，去掉姓名后的装饰点，明确衬线标题与无衬线导航的分工。 | Standardized “Blogs,” removed the dot after the name, and clarified serif headings versus sans-serif navigation. |
| 2026-10-29 | [#1](https://github.com/wenzel-liu/wenzel-liu.github.io/pull/1) | 将网站从 `/lwh/` 迁移到根域名，并提供旧链接跳转支持。 | Moved the site from `/lwh/` to the account root and added support for redirects from former URLs. |

## 网站维护 / Updating the website

页面与共享设计位于 `app/src/`，文章正文及元数据位于 `_content/`，具体写作方式见[文章维护说明](_content/README.md)。导航配置位于 `app/src/content/navigation.ts`；Vite 的站点路径为 `/`，Jekyll 的 `baseurl` 为空。

- React/TypeScript pages and shared design: `app/src/`.
- Article text and metadata: `_content/`; see `_content/README.md`.
- Main navigation: `app/src/content/navigation.ts`.
- Site base: `/` in `app/vite.config.ts`; empty `baseurl` in `_config.yml`.

## 搜索方式 / Search

顶栏可搜索全站页面、栏目与文章正文，进入栏目后可只搜索本栏文章。支持中文、日文，以及忽略大小写和全角差异的英文匹配；空格分隔的关键词需要全部命中，标题与标签匹配优先。PDF 正文不参与搜索。

The header searches public pages, collections and full article text. Each collection also has an article-only search. The build generates a full index and smaller per-collection indexes under `app/public/search/`; each index is fetched only when the visitor enters a query. Queries run in the browser and are not sent to a search service. Chinese/Japanese substring matching and case-insensitive, full-width-normalized English matching are supported. Multiple space-separated terms must all match; titles and tags rank above body text. No PDF contents are indexed.

构建时生成一份全站索引和三份栏目索引，读者输入关键词后才加载所需索引；查询在浏览器内执行，不发送到第三方搜索服务。发布时需提交根目录的 `search/` 索引文件。关闭 JavaScript 后，静态栏目与文章仍可阅读。

`npm run release` also copies the indexes to the root `search/` directory. Keep those generated files with the HTML and assets when publishing. Search is progressively enhanced: without JavaScript, collection/article content remains readable.

搜索结果带有稳定的文章定位链接：Blogs 或栏目结果定位到对应条目并标出位置，文章结果定位到文章标题。目标显示在顶栏下方，文章顺序保持不变；链接可刷新和分享。

Search results include stable article anchors. A Blogs or collection hit positions the matching article entry below the navigation and highlights it; a direct article hit positions the article title. Article ordering is unchanged, and anchors survive reloads and can be shared.

## 本地检查与发布 / Local checks and publishing

首次安装使用 `npm install`，本地预览使用 `npm run dev`。修改网页或文章后，发布前运行单元测试、内容解析测试、TypeScript 检查和浏览器测试。启用实验性全局 Web Storage 的 Node 版本，需使用下面说明中的环境参数运行单元测试。

Run `npm install` for a fresh checkout, then `npm run dev` to preview. After changing site code or articles, run `npm test`, `npm run test:content`, `npx tsc --noEmit -p app/tsconfig.json`, and `npm run test:e2e` before publishing. On Node versions with experimental global Web Storage, run unit tests with `NODE_OPTIONS=--no-experimental-webstorage npm test`.

首次运行 `npm run test:e2e:install` 安装 Chromium 和 WebKit。搜索检查包含鼠标点击、触摸和键盘操作，覆盖 WebKit 点击链接前输入框失焦的情况。

Run `npm run test:e2e:install` once to install the Chromium and WebKit test browsers. Search tests run in both engines, including pointer/touch navigation and keyboard dismissal; WebKit must keep result links visible during the input blur that precedes a click.

运行 `npm run release` 后，提交源码及根目录生成的 HTML、`app-assets/` 和 `search/`。合并已审核的 PR 到 `main`，等待 Pages 部署完成，再检查线上页面。Jekyll 排除项应保留为 `"app/**"`，避免误排除 `app-assets`。

Run `npm run release` and commit the source plus generated root HTML, `app-assets/`, and `search/`. Merge the reviewed change into `main`, wait for the Pages deployment, and verify the public pages and assets. Keep the Jekyll exclusion as `"app/**"`; a plain `app` exclusion also hides `app-assets`.

## 旧链接 / Former URLs

旧仓库从 `pages-redirects` 分支提供跳转。使用 `node app/scripts/project-redirects.mjs <output-directory>` 生成跳转文件，保留查询参数与章节定位，并提供无需 JavaScript 的回退方式；旧仓库中的下载文件和缓存资源继续保留。

`node app/scripts/project-redirects.mjs <output-directory>` generates redirects for all current pages and historical aliases. Their destinations are on the root domain; query strings and section anchors are preserved when JavaScript is enabled. A standard HTML redirect and visible link work without JavaScript. Publish these files to the old repository's `pages-redirects` branch. Keep its existing `assets/` and `app-assets/` files available for shared downloads and cached pages.

## 后续 PR 如何记录 / Maintaining PR notes

后续 PR 请同步维护 [CHANGELOG.md](CHANGELOG.md)：注明所属仓库、PR 链接、实际合并日期，以及含义一致的中英文说明。记录最终合并的变化；未合并内容放在「待发布 / Unreleased」中。

For future PRs, update [CHANGELOG.md](CHANGELOG.md) with the repository, PR link, actual merge date, and equivalent Chinese and English summaries. Describe the final merged changes; keep unmerged work under “待发布 / Unreleased.”
