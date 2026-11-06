# SVG Studio

[English](README.en.md) · [示例 SVG](src/editor/sample.svg) · [已知问题](docs/known-issues.md) · [引擎接入](docs/engine.md)

[![CI](https://github.com/Hello-job/svg-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/Hello-job/svg-studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

受 [GPT Image 2.6 的 SVG 输出能力](https://developers.openai.com/api/docs/guides/image-generation#generate-svg-output)启发，我们做了 SVG Studio：把 AI 生成的图标、插画导入浏览器，继续改色、调整形状、编辑路径，再导出用于项目。让生成后的局部修改也能更顺手。

独立的浏览器 SVG 编辑器，基于 **React + TypeScript + SVG-Edit + shadcn/ui**。默认黑白深色界面，文件在本地处理，无需登录或后端。

![SVG Studio](docs/qa/desktop.jpg)

> **实验版 v0.1.0：** 部分属性修改未触发草稿保存，多选方向键移动可能覆盖原有变换。请保留原始文件并主动下载 SVG，详见[已知问题](docs/known-issues.md)。

## 功能

- **绘图与路径**：基础形状、铅笔、钢笔、文字、节点编辑。
- **属性与外观**：位置、尺寸、旋转、填充、描边、透明度、圆角与模糊。
- **对象与图层**：组合、排序、对齐、显隐、锁定、重命名、撤销/重做。
- **文件与视图**：SVG 导入/源码编辑、SVG/PNG 导出、缩放、平移、标尺。
- **主题**：默认黑白，可选预设色或自定义 HEX，偏好保存在当前浏览器。

## 本地运行

需要 Node.js 22.12+（推荐 24）和 pnpm 11。

```sh
git clone https://github.com/Hello-job/svg-studio.git
cd svg-studio
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

打开 [http://127.0.0.1:4317/](http://127.0.0.1:4317/)。左侧绘图、右侧改属性，Shift 多选，空格/H 平移；帮助按钮可查看快捷键。

## 构建与嵌入

```sh
pnpm build
pnpm preview
```

构建产物为 `dist/`，可由静态服务器托管。子目录部署使用 `pnpm build --base=/svg-studio/`。

当前是独立应用源码，可部署后通过 iframe 嵌入，尚未提供 npm 组件或宿主通信 API。直接接入 React 项目前请阅读[引擎说明](docs/engine.md)：当前页面仅支持一个引擎实例。

## 开发与贡献

```sh
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build
```

界面与主题可从 `src/components/ui/`、`src/styles.css` 和 `src/lib/theme.ts` 修改。开发约定见 [AGENTS.md](AGENTS.md)，功能边界与验证范围见[已知问题](docs/known-issues.md)。

欢迎提交 [Issue](https://github.com/Hello-job/svg-studio/issues) 或 [PR](https://github.com/Hello-job/svg-studio/pulls)，请附浏览器、最小 SVG、复现步骤与验证结果，避免上传敏感作品或凭据。界面改动还需验证编辑、历史与导出流程。

## 许可证

原创代码使用 [MIT License](LICENSE)。SVG-Edit、shadcn/ui 等第三方代码保留原许可，见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
