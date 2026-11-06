# SVG Studio

[简体中文](README.md) · [Sample SVG](src/editor/sample.svg) · [Known issues](docs/known-issues.md) · [Engine integration](docs/engine.md)

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

## Build and embed

```sh
pnpm build
pnpm preview
```

Serve the generated `dist/` directory with a static server. For a subdirectory, use `pnpm build --base=/svg-studio/`.

This is standalone application source, not an npm component library. You can host it and embed it in an iframe; there is no host messaging API yet. Read the [engine notes](docs/engine.md) before direct React integration: only one engine instance is supported per page.

## Development and contributing

```sh
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build
```

Customize UI and themes in `src/components/ui/`, `src/styles.css`, and `src/lib/theme.ts`. See [AGENTS.md](AGENTS.md) for development rules and [known issues](docs/known-issues.md) for limitations and validation coverage.

[Issues](https://github.com/Hello-job/svg-studio/issues) and [PRs](https://github.com/Hello-job/svg-studio/pulls) are welcome. Include your browser, a minimal SVG, reproduction steps, and validation results. Remove sensitive artwork and credentials. UI changes also need browser checks covering editing, history, and export.

## License

Original code uses the [MIT License](LICENSE). SVG-Edit, shadcn/ui, and other dependencies retain their own licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
