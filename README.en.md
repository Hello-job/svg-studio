# SVG Studio

[Try online](https://svg-studio-rho.vercel.app/) · [Component docs](https://svg-studio-rho.vercel.app/install.html) · [简体中文](README.md) · [Sample SVG](src/editor/sample.svg) · [Known issues](docs/known-issues.md) · [Engine integration](docs/engine.md)

[![CI](https://github.com/Hello-job/svg-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/Hello-job/svg-studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Inspired by [GPT Image 2.6's SVG output](https://developers.openai.com/api/docs/guides/image-generation#generate-svg-output), we built SVG Studio to make the next step easier: import AI-generated icons and illustrations, refine colors, shapes, and paths in the browser, then export them for your project.

A standalone browser SVG editor built with **React, TypeScript, SVG-Edit, and shadcn/ui**. Monochrome dark theme by default, local file processing, no account or backend required. The interface currently uses Simplified Chinese.

![SVG Studio](docs/qa/desktop.jpg)

> **Experimental v0.1.0:** Some attribute edits do not trigger draft saving, and multi-selection arrow-key movement can overwrite object transforms. Keep original files and download SVG regularly. See [known issues](docs/known-issues.md).

## Features

- **Drawing and paths:** basic shapes, pencil, pen, text, and node editing.
- **Properties:** position, size, rotation, fill, stroke, opacity, corners, and blur.
- **Objects:** grouping, stacking, alignment, visibility, locking, renaming, and undo/redo.
- **Files and view:** SVG import/source editing, SVG/PNG export, zoom, pan, and rulers.
- **Themes:** neutral default, optional presets and custom HEX colors, saved in the current browser.

## Quick start

Requires Node.js 22.12+ (24 recommended) and pnpm 11.

```sh
git clone https://github.com/Hello-job/svg-studio.git
cd svg-studio
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://127.0.0.1:4317/](http://127.0.0.1:4317/). Draw on the left, edit properties on the right, Shift-click for multiple selection, and hold Space or use H to pan. The help button lists shortcuts.

## Install the React component

In a React project with shadcn/ui and Tailwind CSS configured:

```sh
pnpm dlx shadcn@latest add https://svg-studio-rho.vercel.app/r/svg-studio.json
```

```tsx
"use client";
import { SvgStudio } from "@/components/svg-studio";

<SvgStudio
  editorUrl="https://svg-studio-rho.vercel.app/"
  filename="design.svg"
  onChange={(svg) => console.log(svg)}
  onSave={({ svg, filename }) => console.log(filename, svg)}
/>;
```

You can replace `editorUrl` with your deployment. The CLI installs the component and protocol source; the full editor runs in an iframe to isolate styles and engine lifetime, supporting multiple instances and remounting. Use `defaultValue` for initial SVG, `value / onChange` for controlled editing, and `onReady / onError` for loading results. With `onSave`, the host handles saving; otherwise SVG is downloaded. Input limit: 5 MB. Embedded editors do not read or write standalone drafts. See [engine integration](docs/engine.md).

## Deploy

```sh
pnpm build
pnpm preview
```

Import this repository into Vercel. `vercel.json` configures Vite, `pnpm build`, and the `dist/` output; no environment variables or backend are required. The homepage is the editor, `/install.html` contains installation instructions and a live component example, and `/r/svg-studio.json` is the public registry item. Builds regenerate the registry from its source.

You can also serve `dist/` with a static server. For a subdirectory, use `pnpm build --base=/svg-studio/`.

## Development and contributing

```sh
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build
```

Customize UI and themes in `src/components/ui/`, `src/styles.css`, and `src/lib/theme.ts`. See [AGENTS.md](AGENTS.md) for development rules and [known issues](docs/known-issues.md) for limitations and validation coverage.

[Issues](https://github.com/Hello-job/svg-studio/issues) and [PRs](https://github.com/Hello-job/svg-studio/pulls) are welcome. Include your browser, a minimal SVG, reproduction steps, and validation results. Remove sensitive artwork and credentials. UI changes also need browser checks covering editing, history, and export.

## License

Original code uses the [MIT License](LICENSE). SVG-Edit, shadcn/ui, and other dependencies retain their own licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
