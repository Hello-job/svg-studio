# Third-party notices

SVG Studio uses third-party packages under their respective licenses. This notice does not grant an open-source license for SVG Studio itself.

| Package                  | License               | Upstream                               |
| ------------------------ | --------------------- | -------------------------------------- |
| React / React DOM        | MIT                   | https://github.com/facebook/react      |
| @svgedit/svgcanvas 7.4.2 | MIT                   | https://github.com/SVG-Edit/svgedit    |
| Radix UI                 | MIT                   | https://github.com/radix-ui/primitives |
| Lucide React             | ISC                   | https://github.com/lucide-icons/lucide |
| DOMPurify                | Apache-2.0 OR MPL-2.0 | https://github.com/cure53/DOMPurify    |

SVG-Edit includes code attributed to Alexis Deveria, Pavol Rusnak, Jeff Schiller, OptimistikSAS, and other contributors. The original SVG-Edit MIT license is reproduced in `docs/licenses/svg-edit-MIT.txt`. The direct runtime packages' license texts, including SVG-Edit, are also bundled at `public/licenses/third-party.txt` and copied to `dist/licenses/third-party.txt` on build.

Dependencies and transitive dependencies retain their original notices. See each package's LICENSE files and `pnpm-lock.yaml` for the exact installed versions.
