# Third-party notices

SVG Studio's original code is licensed under the [MIT License](LICENSE). Third-party packages and adapted code retain their respective licenses and notices below.

| Package                  | License               | Upstream                                      |
| ------------------------ | --------------------- | --------------------------------------------- |
| React / React DOM        | MIT                   | https://github.com/facebook/react             |
| @svgedit/svgcanvas 7.4.2 | MIT                   | https://github.com/SVG-Edit/svgedit           |
| Radix UI                 | MIT                   | https://github.com/radix-ui/primitives        |
| Lucide React             | ISC                   | https://github.com/lucide-icons/lucide        |
| DOMPurify                | Apache-2.0 OR MPL-2.0 | https://github.com/cure53/DOMPurify           |
| shadcn/ui                | MIT                   | https://github.com/shadcn-ui/ui               |
| class-variance-authority | Apache-2.0            | https://github.com/joe-bell/cva               |
| clsx                     | MIT                   | https://github.com/lukeed/clsx                |
| tailwind-merge           | MIT                   | https://github.com/dcastil/tailwind-merge     |
| Tailwind CSS             | MIT                   | https://github.com/tailwindlabs/tailwindcss   |
| tw-animate-css           | MIT                   | https://github.com/Wombosvideo/tw-animate-css |

SVG-Edit includes code attributed to Alexis Deveria, Pavol Rusnak, Jeff Schiller, OptimistikSAS, and other contributors. The original SVG-Edit MIT license is reproduced in `docs/licenses/svg-edit-MIT.txt`. The direct runtime packages' license texts, including SVG-Edit, are also bundled at `public/licenses/third-party.txt` and copied to `dist/licenses/third-party.txt` on build.

Dependencies and transitive dependencies retain their original notices. See each package's LICENSE files and `pnpm-lock.yaml` for the exact installed versions.

The components in `src/components/ui/` are adapted from shadcn/ui's `new-york-v4` registry (Radix). Local changes resolve imports, translate close labels, and align overlay stacking with the editor. The original MIT license is reproduced in `docs/licenses/shadcn-ui-MIT.txt` and bundled with the distributed notices. The theme configuration and editor layout are local code.
