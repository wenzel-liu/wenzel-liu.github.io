# PR 更新记录 / PR changelog

[返回仓库说明 / Back to README](README.md) · [访问网站 / Visit website](https://wenzel-liu.github.io/)

本记录按合并时间倒序整理个人网站的更新，日期使用日本时间（JST）。内容根据各 PR 的说明与合并记录整理；当前仓库与旧仓库分别编号，链接可查看原始变更。

This log summarizes website updates in reverse merge order, using Japan Standard Time (JST). Entries are based on each PR’s description and merge record. PR numbers are separate for the current and former repositories; links lead to the original changes.

## 待发布 / Unreleased

### 中英双语仓库说明与 PR 历史 / Bilingual repository documentation and PR history

**中文：** 用中英文补充 README，介绍网站、搜索和维护方式。汇总当前仓库与迁移前 `lwh` 仓库的全部已合并 PR，逐条说明更新内容，并注明后来调整过的设计。增加后续维护双语记录的约定；本次仅修改文档。

**English:** Expanded the README in Chinese and English to explain the site, search, and maintenance workflow. Documented all merged PRs in the current and former `lwh` repositories, including later revisions to earlier design choices. Added guidance for future bilingual PR notes. This update changes documentation only.

## 当前仓库 / Current repository: wenzel-liu.github.io

### 2026-10-30 · [PR #4](https://github.com/wenzel-liu/wenzel-liu.github.io/pull/4) · 全站搜索与文章定位 / Site search and article positioning

**中文：** 在共享顶栏加入全站搜索，并为 MedPrism、Sci-Industrialist 和 Notes & essays 提供栏目内文章搜索，覆盖标题、标签、简介和正文。索引按需加载，查询在浏览器内执行，支持命中片段、清空恢复、失败重试及键盘和触摸操作。修复 WebKit 点击结果时列表过早收起的问题；文章结果定位到标题，Blogs 或栏目结果定位到对应条目，避开固定顶栏并保持原有文章顺序。定位链接支持刷新、分享、返回和同页重复搜索。

**English:** Added global search to the shared header and scoped article search to MedPrism, Sci-Industrialist, and Notes & essays, covering titles, tags, descriptions, and body text. Indexes load on demand and queries run in the browser, with excerpts, reset/retry behavior, and keyboard/touch support. Fixed WebKit closing results before a click could navigate. Article results position the title below the fixed header; Blogs and collection results position the matching entry without reordering articles. Destination links support reloads, sharing, back navigation, and repeated searches on the same page.

### 2026-10-29 · [PR #3](https://github.com/wenzel-liu/wenzel-liu.github.io/pull/3) · 公开随笔与栏目图标 / Public journal entries and collection branding

**中文：** 新增 5 篇公开版日常随笔和 1 篇 Sci-Industrialist 图标说明，删除《欢迎来到我的博客》和《东京学术生活：在日本进行心血管研究的体验》。为 Notes & essays 建立独立 `/notes/` 页面；Blogs 预览最近 3 篇，栏目页显示全部文章，文章返回链接指向所属栏目。加入 Sci-Industrialist 深浅色图标、MedPrism 标志和图标构造图；统一首页研究与临床教育标题的字形，为 Clinical Education 保留强调色，并隐藏短文的空目录。

**English:** Added five public journal entries and an essay about the Sci-Industrialist symbol; removed the welcome post and the Tokyo academic-life sample post. Created a dedicated `/notes/` page: Blogs previews the three newest entries, the collection lists all entries, and article return links lead back to the collection. Added light/dark Sci-Industrialist icons, the MedPrism logo, and a symbol-construction illustration. Unified the research/clinical-education heading style, retained an accent color for Clinical Education, and removed empty contents lists from short articles.

### 2026-10-29 · [PR #2](https://github.com/wenzel-liu/wenzel-liu.github.io/pull/2) · Blogs 命名与导航字体 / Blogs naming and navigation typography

**中文：** 删除首页 Wenhao Liu 后的装饰点，在导航、页面标题、首页标签、栏目返回链接及旧链接跳转标题中统一使用复数 Blogs。导航、按钮、主题切换、Menu 和文章目录使用无衬线字体；姓名与编辑性标题保留衬线字体，已有网址保持有效。

**English:** Removed the decorative dot after Wenhao Liu and standardized “Blogs” across navigation, page titles, homepage labels, collection return links, and legacy redirect titles. Used sans-serif type for navigation, buttons, theme controls, Menu, and article contents while retaining serif type for the name and editorial headings. Existing URLs remained valid.

### 2026-10-29 · [PR #1](https://github.com/wenzel-liu/wenzel-liu.github.io/pull/1) · 迁移到根域名 / Move to the account root

**中文：** 将网站从 `wenzel-liu.github.io/lwh/` 迁移到 `wenzel-liu.github.io/`，更新构建路径、规范网址、内部链接、图片路径和源码仓库链接。加入旧站 29 个当前页面与历史地址的跳转生成器，保留查询参数和章节定位，并提供 HTML 跳转及可点击链接作为回退。保留已有设计和文章正文；旧仓库随后承担链接跳转与旧资源兼容。

**English:** Moved the site from `wenzel-liu.github.io/lwh/` to `wenzel-liu.github.io/`, updating build base paths, canonical URLs, internal links, an image path, and the source-repository link. Added a redirect generator for 29 canonical and historical routes, preserving queries and fragments with HTML redirects and visible links as fallbacks. Kept the existing design and article text; the former repository subsequently served redirects and retained legacy assets.

## 迁移前的仓库 / Former repository: lwh

以下 PR 属于 [wenzel-liu/lwh](https://github.com/wenzel-liu/lwh)，其代码历史已延续到当前主页仓库。这里保留当时的变化，并注明后来被调整的设计。

These PRs belong to [wenzel-liu/lwh](https://github.com/wenzel-liu/lwh), whose code history continues in the current repository. The entries preserve the changes made at the time and identify choices revised later.

### 2026-10-29 · [lwh PR #6](https://github.com/wenzel-liu/lwh/pull/6) · 分开文章与项目 / Separate writing from projects

**中文：** 在 Blog 后加入独立 Projects 导航，为 Focus Reader 建立项目展示页；Blog 顶部展示 MedPrism 与 Sci-Industrialist，日常随笔放在下方。首页分别展示项目与写作，旧 Projects 地址跳转到新页面。细化字体分工：标题、出版物名称和英文文章正文使用衬线，功能控件、元数据、表格与中文正文使用无衬线。保留文章内容、网址和两个斜体栏目副标题；导航字体在当前仓库 PR #2 中进一步统一。

**English:** Added a separate Projects destination after Blog and a dedicated Focus Reader showcase. Blog opened with MedPrism and Sci-Industrialist, followed by everyday notes. Separated projects from writing on the homepage and redirected former Projects URLs. Refined typography: serif headings, publication titles, and English article prose; sans-serif controls, metadata, tables, and Chinese body text. Preserved article content, URLs, and both italic collection subtitles. Navigation typography was further standardized in the current repository’s PR #2.

### 2026-10-29 · [lwh PR #5](https://github.com/wenzel-liu/lwh/pull/5) · 姓名与早期字体调整 / Display name and an earlier typography update

**中文：** 将显示名称统一为 Wenhao Liu，覆盖首页、页眉页脚、页面说明、文章作者元数据和旧页面跳转。当时将顶栏姓名、导航和菜单控件调整为衬线，并适配桌面与手机字号。导航与功能控件后来在 lwh PR #6 及当前仓库 PR #2 中调整为无衬线；本条记录的是当时的版本。

**English:** Standardized the display name as Wenhao Liu across the homepage, header/footer, descriptions, article-author metadata, and legacy redirects. At that stage, applied serif type to the header name, navigation, and menu controls with desktop/mobile sizing. Navigation and functional controls were later revised to sans-serif in lwh PR #6 and the current repository’s PR #2; this entry records the earlier version.

### 2026-10-29 · [lwh PR #4](https://github.com/wenzel-liu/lwh/pull/4) · 修复 Pages 静态资源发布 / Fix static assets in Pages output

**中文：** 修复 Jekyll 将 `exclude: app` 视为前缀、连同 `app-assets` 一起排除的问题，解决线上 CSS、JavaScript 和数学公式字体返回 404。将排除项改为 `app/**`，排除源代码目录，同时保留编译资源；不修改文章或前端功能。

**English:** Fixed Jekyll treating `exclude: app` as a prefix and also excluding `app-assets`, which caused live CSS, JavaScript, and equation fonts to return 404. Changed the exclusion to `app/**`, keeping source files excluded while publishing compiled assets. Article content and frontend behavior were unchanged.

### 2026-10-29 · [lwh PR #3](https://github.com/wenzel-liu/lwh/pull/3) · 文章迁出 Notion / Move article collections from Notion

**中文：** 将 MedPrism 和 Sci-Industrialist 改为 GitHub Pages 内的文章栏目，导入 7 篇导出文章，保留原正文、日期和本地配图。加入斜体副标题：MedPrism 的 *Biopharma Insight*，以及 Sci-Industrialist 的 *Technology, Manufacturing & Historical Materialism*。文章使用 Markdown 维护，构建时生成完整 HTML 和数学公式；阅读页支持目录、表格、图片和明暗模式，读者仅加载所选文章，旧链接继续有效。资源发布问题由随后的 lwh PR #4 修复。

**English:** Replaced the MedPrism and Sci-Industrialist Notion links with GitHub Pages article collections, importing seven exported articles while preserving their text, dates, and local imagery. Added the italic subtitles *Biopharma Insight* and *Technology, Manufacturing & Historical Materialism*. Articles are maintained in Markdown and rendered to complete HTML and equations at build time. Reading pages support contents navigation, tables, images, and light/dark themes; readers load only the selected article, and former links remain valid. The following lwh PR #4 fixed compiled-asset publication.

### 2026-10-29 · [lwh PR #2](https://github.com/wenzel-liu/lwh/pull/2) · 统一整站设计 / Unify the site design

**中文：** 将当时的 4 个主页面与 3 篇文章统一为米白与绿色设计，统一字体、导航、页脚、按钮、响应式布局和深色模式。首页与 Blog 突出独立项目，加入 Focus Reader 交互演示；经历页采用时间线，论文和报告按年份整理。文章页使用统一阅读布局、目录和相关阅读，保留原文、日期和许可，兼容 12 个历史地址。

**English:** Applied one cream-and-green design to the four main pages and three articles then present, unifying typography, navigation, footer, buttons, responsive layouts, and dark mode. Foregrounded independent projects on the homepage and Blog, added an interactive Focus Reader demonstration, organized experience as a timeline, and grouped papers and talks by year. Articles received a shared reading layout, contents navigation, and related reading while preserving their text, dates, and licenses and supporting twelve historical routes.

### 2026-10-12 · [lwh PR #1](https://github.com/wenzel-liu/lwh/pull/1) · 更新个人资料与 Focus Reader / Update the profile and feature Focus Reader

**中文：** 更新已完成的博士学位、现任职位和工作经历，移除过期的博士候选人表述，并同步网站身份元数据。在首页和项目页展示 Focus Reader，说明选中文字增强、文章阅读模式和本地处理方式，并提供源码与安装链接。校正当时的 `/lwh` 站点路径，补齐 TypeScript 所需类型声明，重新构建 Pages 发布文件。

**English:** Updated the completed Ph.D., current role, and experience timeline, removed outdated Ph.D.-candidate wording, and synchronized identity metadata. Featured Focus Reader on the homepage and projects page, describing selected-text enhancement, article reading, and local processing with source and installation links. Corrected the then-current `/lwh` base path, added the TypeScript declarations needed by the build, and regenerated Pages release files.
