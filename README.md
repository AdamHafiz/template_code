# Static Site Template

This is a production template for building static sites (landing pages, corporate sites, campaign sites).
Rather than using an SPA framework, it takes the traditional approach of **building pages with EJS, writing styles with Sass, and bundling JS with webpack**, updated to work with current Node and CSS tooling.

```
npm install     # first time only
npm run dev     # development (opens http://localhost:3000)
npm run build   # outputs the deliverable to release/
```

> Run all commands from inside `htdocs/`.

---

## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Command List](#command-list)
- [Directory Structure](#directory-structure)
- [Adding a Page](#adding-a-page)
- [Writing Styles](#writing-styles)
- [Writing JavaScript](#writing-javascript)
- [Placing Images](#placing-images)
- [Changing Build Settings](#changing-build-settings)
- [Git Workflow Rules](#git-workflow-rules)
- [Troubleshooting](#troubleshooting)

---

## Requirements

|         | Version         | Notes                                          |
| ------- | ---------------- | ----------------------------------------------- |
| Node.js | **20 LTS or later** | An `.nvmrc` is provided, so `nvm use` will switch automatically |
| npm     | 9 or later        | The version bundled with Node is fine           |

> **Note if you're using Node 18**
> `sharp`, which is used for image optimization, does not support Node versions below 18.17, so the native binary silently fails to install during `npm install`.
> Even in that state, the HTML/CSS/JS build will still pass — only images will end up as "unoptimized copies" (a warning will appear at runtime).
> If you need image optimization to work, upgrade to Node 20 and re-run `npm install`.

---

## Getting Started

```bash
cd htdocs
nvm use          # reads .nvmrc and switches to Node 20
npm install
npm run dev
```

`npm run dev` starts a local server, and changes to `src/` are reflected automatically on save.
CSS updates are hot-swapped without a page reload, so you can adjust styling while a modal or accordion is open.

Things to do first:

1. Update `site` in `htdocs/src/config/site.json` with the actual site information
2. Update the colors and fonts in `htdocs/src/sass/foundation/_variables.scss` for the project
3. Clear out `htdocs/src/ejs/index.ejs` and start writing your markup

---

## Command List

| Command                | What it does                                          |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`          | Dev server + file watcher. Output goes to `develop/`  |
| `npm run build`        | Production build. Minifies CSS/JS and outputs to `release/` |
| `npm run preview`      | View the production build locally to check it          |
| `npm run images`       | Re-optimize images only                                 |
| `npm run clean`        | Removes `develop/` and `release/`                       |
| `npm run format`       | Formats all files with Prettier                         |
| `npm run format:check` | Checks formatting only, without making changes (for CI) |

You can also run individual tasks directly:

```bash
npx gulp html      # EJS only
npx gulp styles    # Sass only
npx gulp scripts   # JS only
```

If you don't want the browser to open automatically, use `BS_OPEN=false npm run dev`.

---

## Directory Structure

```
htdocs/
├── build/                    Build processing (generally don't touch)
│   ├── config.js             ★ Paths, quality, and flag settings are consolidated here
│   ├── webpack.config.js
│   ├── tasks/                html / styles / scripts / images / serve
│   └── util/
│
├── src/                      ★ This is where you work
│   ├── config/site.json      Site info and meta for all pages
│   ├── ejs/
│   │   ├── index.ejs         Top page
│   │   ├── about/index.ejs   Example subpage
│   │   └── _partials/        Shared parts like head / header / footer
│   ├── sass/
│   │   ├── share.scss        CSS entry point (list @use statements here)
│   │   ├── _tools.scss       Entry point for variables, functions, mixins
│   │   ├── foundation/       Reset, variables, functions, mixins, base
│   │   ├── layout/           l-  Framework elements like header/footer
│   │   ├── component/        c-  Reusable parts like buttons
│   │   └── page/             p-  Page-specific styles
│   ├── js/
│   │   ├── index.js          Entry point. Just calls modules
│   │   └── modules/          Split by feature
│   └── assets/
│       ├── img/              Images that get optimized
│       └── data/             Files copied as-is (PDFs, videos, etc.)
│
├── develop/                  Dev output (not tracked by Git)
└── release/                  Delivery output (not tracked by Git)
```

`develop/` and `release/` are regenerated on every build. **Editing them directly will be overwritten on the next build.**

---

## Adding a Page

Adding a page takes **2 steps**.

**1. Place the EJS file**

```
src/ejs/company/index.ejs   →  output as /company/
src/ejs/contact.ejs         →  output as /contact.html
```

Files starting with `_` are treated as partials and are not output on their own.

**2. Add a key to `pages` in `src/config/site.json`**

The key is the path from `src/ejs/`, without the extension.

```json
{
  "pages": {
    "index": { "isTop": true, "title": "Site Name" },
    "company/index": {
      "title": "About Us",
      "description": "Page-specific description",
      "noindex": false
    }
  }
}
```

If you omit `description` or similar fields, the common value from `site` is used instead.

### Values available inside EJS

You don't need to declare variables on the page side. They're passed in automatically at build time.

| Variable                           | Contents                                                  |
| ----------------------------------- | ---------------------------------------------------------- |
| `site`                             | The `site` object from `site.json` (site name, baseUrl, etc.) |
| `page`                             | That page's settings + `id` / `url`                        |
| `lang`                             | Language code                                               |
| `relative_path`                    | Relative path to the root. `./` or `../` is **inserted automatically** |
| `isRelease`                        | `true` for a production build                                |
| `asset(relative_path, filename)`   | Returns a URL with a `?v=` cache-busting param              |

This eliminates the typos that used to happen when `relative_path` was written by hand on each page.

### noindex in development

HTML output from `npm run dev` automatically includes `<meta name="robots" content="noindex, nofollow">`.
This prevents preview URLs from accidentally appearing in search results, and is not included in `npm run build`.
If you want to exclude a specific page from indexing even in production, set `"noindex": true` for that page in `site.json`.

---

## Writing Styles

### Where to start writing

| Type                          | Location           | Class prefix |
| ------------------------------ | -------------------- | ------------- |
| Framework elements like header/footer | `sass/layout/`    | `l-`     |
| Reusable parts like buttons     | `sass/component/` | `c-`     |
| Page-specific styles            | `sass/page/`      | `p-`     |

After adding a file, add one `@use` line to `src/sass/share.scss`.

### At the top of each file

Variables, functions, and mixins are all consolidated in `_tools.scss`, so **this one line** gives you access to everything.

```scss
@use '../tools' as *;
```

### Frequently used functions and mixins

```scss
.foo {
  font-size: rem(16); // equivalent to 16px (html is set to 62.5%, so this is 1.6rem)
  width: get-vw(750); // converts 750px from the design to vw
  max-width: get-min(1200); // scales with vw but caps at 1200px
  z-index: z('header'); // prevents scattered magic numbers

  @include sp {
    // 767px and below
    font-size: rem(14);
  }

  @include pc {
    // 768px and above
    @include hover {
      // hover only on devices that support a mouse
      opacity: 0.7;
    }
  }

  @include container; // center + horizontal padding
  @include line-clamp(2); // truncate to 2 lines with "…"
}

.title {
  font-size: fluid(24, 48); // smoothly interpolates between 24px and 48px based on screen width
}
```

### Showing/hiding by device

```html
<p class="u-pc-only">Shown on PC only</p>
<p class="u-sp-only">Shown on SP only</p>
```

### Colors and fonts

Configured so that the only thing you need to change per project is the color block in `foundation/_variables.scss`.

### External library CSS

Consolidated in `foundation/_vendor.scss`. Since paths resolve through `node_modules`, you can reference packages directly by name.
Remove the line for any library you're not using (this reduces the resulting CSS size).

```scss
@use 'swiper/swiper.css';
```

---

## Writing JavaScript

`src/js/index.js` is where you specify *what* runs. The actual logic is split out into `src/js/modules/`.

```js
import { initSlider } from '@/modules/slider';
```

`@` is an alias pointing to `src/js`. You can use the same import style regardless of how deeply nested the file is.

Included modules:

| Module                 | Contents                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| `modules/device.js`    | Device/browser detection. Adds classes like `is-sp` / `is-ios` to `body` |
| `modules/viewport.js`  | Provides a `--vh` CSS variable unaffected by the mobile address bar     |
| `modules/slider.js`    | A Swiper example. Does nothing on pages without the relevant element    |

### Adding a library

```bash
npm install package-name
```

Just `import` it and it gets bundled automatically. The transpilation target browsers are read from
`browserslist` in `package.json`. CSS vendor prefixes reference the same setting, so **you manage
target browsers in a single place**.

---

## Placing Images

Files placed in `src/assets/img/` are optimized automatically at build time.

- `.jpg` / `.png` → re-encoded, and **a `.webp` version is automatically generated alongside it**
- `.svg` → unnecessary attributes/comments are stripped (`viewBox` is preserved)
- `.gif` / `.ico` → copied as-is

```html
<picture>
  <source srcset="<%= relative_path %>assets/img/hero.webp" type="image/webp" />
  <img src="<%= relative_path %>assets/img/hero.jpg" alt="" />
</picture>
```

Once an image has been output, it won't be reprocessed unless the source file is updated.
Place files you don't want converted, such as PDFs or videos, in `src/assets/data/` (these are copied as-is).

To adjust quality, edit `images.quality` in `build/config.js`.

---

## Changing Build Settings

Nearly everything you'd need to change is consolidated in `build/config.js`.

| Setting            | Description                                                     |
| -------------------- | ------------------------------------------------------------------ |
| `html.beautify`    | Whether to format the `release` HTML output (default `true`; intended for delivery) |
| `images.quality`   | JPEG / PNG / WebP quality                                           |
| `images.webp`      | Set to `false` to disable automatic `.webp` generation              |
| `server`           | browser-sync settings, such as auto-opening the browser             |
| `src` / `out`      | Input/output paths                                                 |

Target browsers are set via `browserslist` in `package.json`.

---

## Git Workflow Rules

### What not to commit

`develop/` and `release/` are **not committed** (already in `.gitignore`).
Since their contents change on every build, tracking them would cause conflicts on every pull.

### Commit messages

```
Page, location: what was done
```

Example:

```
Top page first view: adjusted slider transition speed
Subpage About Us: fixed table layout breaking on SP
```

---

## Troubleshooting

**`npm run dev` throws an error**
Check your Node version (`node -v` should be 20 or higher). `nvm use` will switch it for you.

**Images aren't optimized / sharp warning appears**
Switch to Node 20, then re-run `npm install` or run `npm rebuild sharp`.

**Sass says a variable can't be found**
Check that the file starts with `@use '../tools' as *;`.
`@use` is required in every file (unlike `@import`, it does not propagate to other files).

**CSS changes aren't showing up**
Check whether you added the `@use` line to `src/sass/share.scss`.
Files starting with `_` are not included in the output unless they're `@use`'d from somewhere.

**Build passes, but the browser shows old CSS**
This normally shouldn't happen since CSS/JS URLs include a `?v=` param, but if it does,
try a hard reload (Ctrl+Shift+R).

---

## Changes from the Previous Template

Key points for those coming from the old template.

|                          | Old                                                              | New                                                                    |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Commands                 | `gulp d` / `gulp r`                                                | `npm run dev` / `npm run build` (`gulp d` / `gulp r` are still kept) |
| gulpfile                  | Single file, ~300 lines                                             | Split into `build/tasks/`; `gulpfile.js` just shows the flow          |
| meta info                 | `src/config/meta.json`                                              | `src/config/site.json` (supports per-page overrides and canonical)   |
| relative_path             | Hand-written on each page                                            | Calculated automatically at build time                                |
| Vendor prefixes           | **Not applied** (`pleeease.json` wasn't being read by anything)      | autoprefixer + `browserslist`                                         |
| Sass structure            | `setting/` + `template/`                                            | `foundation/` `layout/` `component/` `page/`                           |
| Image optimization        | 4 imagemin-family packages                                           | Just `sharp` + `svgo`                                                  |
| Image webp                | Run manually as a separate task                                     | Generated automatically at build time                                  |
| Source maps               | Also output in production                                            | Development only                                                       |
| Cache busting             | None                                                                 | `?v=` automatically appended to CSS/JS                                 |

Sass behavior changes to be aware of:

- `.sp-none` → `.u-pc-only`, `.pc-none` → `.u-sp-only`
  (the old `.sp-none` was set to `display: none` on both PC and SP, so it was always hidden)
- `body` font size
  (the old template applied `font-size: 62.5%` to both `html` and `body`, resulting in an actual size of 6.25px)
- `@include max-screen()` → `@include sp()`, `@include min-screen()` → `@include pc()`
- Removed `*:focus { outline: 0 }` in favor of `:focus-visible`, which only shows the outline during keyboard navigation
