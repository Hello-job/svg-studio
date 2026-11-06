# SVG Studio

[English](README.en.md) · [功能与已知问题](docs/known-issues.md) · [引擎接入](docs/engine.md) · [参与贡献](CONTRIBUTING.md)

[![CI](https://github.com/Hello-job/svg-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/Hello-job/svg-studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

受 [GPT Image 2.6 的 SVG 输出能力](https://developers.openai.com/api/docs/guides/image-generation#generate-svg-output)启发，我们做了 SVG Studio：把 AI 生成的图标、插画导入浏览器，继续改色、调整形状、编辑路径，再导出用于项目。让生成后的局部修改也能更顺手。

一个可自行部署的浏览器 SVG 编辑器。使用 **React + TypeScript + SVG-Edit**，界面采用 **shadcn/ui 默认黑白主题**，保留紧凑的工具栏、属性面板和图层列表。

打开 SVG、编辑图形与路径、调整外观，再下载 SVG 或 PNG。文件在浏览器中处理，无需登录，不需要后端；文档草稿与主题偏好保存在当前浏览器。

![SVG Studio 默认黑白界面，画板中的示例为可编辑 SVG](docs/qa/desktop.jpg)

> **当前为实验性版本 v0.1.0。** 已知部分属性修改不会触发草稿保存，多选方向键移动也可能覆盖对象的原有变换。重要作品请保留原始文件并主动下载 SVG。完整复现步骤与待完善范围见[已知问题](docs/known-issues.md)。

## 可以做什么

| 分类 | 当前提供的功能                                                                     |
| ---- | ---------------------------------------------------------------------------------- |
| 绘图 | 选择与多选、矩形、椭圆、直线、铅笔、钢笔、文字、固定参数的星形与六边形             |
| 路径 | 节点选择与拖动、增加/删除节点、直线/曲线、打开/闭合路径                            |
| 属性 | 位置、尺寸、等比缩放、旋转、翻转、圆角、透明度、填充、描边、线型、端点、连接与模糊 |
| 文字 | 文本内容、基础字体选择、字号、粗体、斜体                                           |
| 对象 | 剪切、复制、粘贴、副本、删除、组合/拆组、上下层排序、对齐与分布                    |
| 图层 | 对象列表、显隐、锁定、Shift 多选、双击名称重命名                                   |
| 视图 | 缩放、适合窗口、平移、标尺、透明网格、收起属性面板                                 |
| 文件 | 新建画布、选择/拖入 SVG、编辑 SVG 源码、下载 SVG、原尺寸 PNG 导出                  |
| 外观 | 默认黑白深色界面、可选主题色、自定义 HEX、恢复默认、本机偏好记忆                   |

首次启动会打开一个可编辑的示例文档。撤销/重做、快捷键、草稿恢复与替换确认已经接入，但仍有[需要修复的边界情况](docs/known-issues.md)，不代表完整覆盖专业矢量编辑器的能力。

## 本地运行

需要 **Node.js 22.12+**（推荐 Node.js 24）和 **pnpm 11**。精确的 pnpm 版本由 `package.json` 中的 `packageManager` 固定。

```sh
git clone https://github.com/Hello-job/svg-studio.git
cd svg-studio
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

打开 [http://127.0.0.1:4317/](http://127.0.0.1:4317/)。默认端口为 `4317`，端口被占用时服务会报错。

不需要配置 API Key、数据库或环境变量。`localhost` 与 `127.0.0.1` 是不同来源，草稿和主题偏好分别保存，使用时建议固定一个地址。

## 基本操作

- 使用左侧工具绘图；选择图形后，在右侧修改变换和外观。
- Shift 点击可多选；空格或 H 平移；底栏可调整缩放。
- 选择路径后切换节点工具，或使用节点工具点击路径；删除节点请先使用面板中的按钮。
- 通过顶部“文件”菜单打开文档，通过“保存 SVG”下载矢量文件；“导出”菜单提供 PNG 和源码入口。
- 点击底栏尺寸入口取消选择，即可在属性面板修改画布尺寸。
- 右上角帮助按钮列出快捷键。Windows / Linux 使用 Ctrl，macOS 使用 ⌘。

常用快捷键：V 选择、A 节点、R 矩形、O 椭圆、P 钢笔、T 文字、⌘/Ctrl + S 保存、⌘/Ctrl + Z 撤销。

## 主题与界面定制

默认使用 **shadcn/ui New York / Neutral 的黑白深色风格**；没有默认彩色主按钮，也没有浅色模式。

右上角“外观设置”可选默认、蓝色、紫色、绿色、橙色、玫红，或输入自定义 HEX 色值。主题色仅影响编辑器的按钮、焦点与选区，不会修改作品的填充、描边和导出内容。点击“重置”恢复黑白主题。

开发时可以从以下位置定制：

| 文件                                | 用途                                           |
| ----------------------------------- | ---------------------------------------------- |
| `src/styles.css`                    | 标准 shadcn 语义变量、编辑器布局与紧凑字段样式 |
| `src/lib/theme.ts`                  | 主题预设、黑白默认值、颜色校验与浏览器偏好读取 |
| `src/components/theme-settings.tsx` | 外观设置面板                                   |
| `src/components/ui/`                | 可直接修改的 shadcn/ui 基础组件源码            |
| `components.json`                   | shadcn 的样式与路径配置                        |

## 构建与自行部署

```sh
pnpm build
pnpm preview
```

`pnpm build` 生成 `dist/`，`pnpm preview` 提供本地构建预览。将 `dist/` 交给静态文件服务器即可部署，不需要 Node.js 后端。预览命令不作为生产服务器。

默认构建使用站点根路径。若放在 `/svg-studio/` 子目录，构建时指定资源前缀：

```sh
pnpm build --base=/svg-studio/
```

SVG-Edit 引擎独立延迟加载。当前构建会提示引擎 chunk 约 1.1 MB，这是已知的体积限制，没有通过提高警告阈值隐藏。

仓库没有附带公开在线演示站点。

## 在其他项目中使用

当前发布的是**独立编辑器应用源码**，尚未封装成可以 `npm install` 的 React 组件库，也没有稳定的宿主通信 API。`package.json` 保留 `private: true`，用于防止误发布 npm 包，不影响源码的 MIT 开源许可。

可以先构建并托管独立编辑器，再通过 iframe 嵌入：

```html
<iframe
  src="/svg-studio/"
  title="SVG Studio 编辑器"
  style="width: 100%; height: 720px; border: 0"
></iframe>
```

示例假设应用已按 `/svg-studio/` 的资源前缀构建。导入与导出仍通过编辑器界面进行；上述示例不提供宿主直接传入 SVG 的接口。

如果要把组件直接搬入 React 项目，先阅读[引擎接入说明](docs/engine.md)：当前 SVG-Edit 内部有共享模块状态和不完整的销毁能力，页面仅初始化一个引擎实例。不能直接添加 StrictMode、反复挂载编辑器或在同一页面并排创建多个实例。

## 文件、草稿与导入边界

- 应用没有文件上传、账户或云端保存流程。导入与导出由浏览器本地处理。
- 本机草稿只保留最近一个文档，不包含撤销栈。清理站点数据、切换浏览器或切换来源都会影响草稿可用性。
- 草稿不是可靠备份；目前还有属性变动未触发写入的问题，请定期下载 SVG。
- 外部 SVG 会经过 XML 检查和 DOMPurify 清理；脚本、HTML、动画、嵌入样式表及外部资源会移除。
- 文档内的部分渐变、裁剪与内嵌位图引用可保留，但不保证无损往返。复杂 CSS、字体、滤镜、单位等可能改变外观，请保留原始文件。

## 当前边界与后续方向

优先修复保存状态、多选变换、星形插入、节点快捷键与导入兼容性，详见[已知问题与待完善功能](docs/known-issues.md)。

尚未提供可视化渐变编辑、路径布尔运算、文字转轮廓、网格吸附与智能参考线、完整图层树、多画板、协作或云端文件库。界面以桌面鼠标和键盘为主；Safari、Firefox、触控笔、多点手势与大型 SVG 性能仍需专项验证。

## 开发与验证

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

GitHub Actions 会在 `main` 推送及 Pull Request 中运行上述检查。单元测试覆盖导入清理、快捷键解析、草稿格式、数值字段与主题偏好，**不是完整的引擎端到端测试**。交互验证范围见[验收记录](design-qa.md)。

```text
src/
  app.tsx                 应用装配、文件流程与草稿生命周期
  components/             工具栏、属性、图层、弹窗与主题设置
    ui/                   shadcn/ui 基础组件源码
  editor/
    session.ts            SVG-Edit 适配、选区、历史与视图
    types.ts              固定引擎版本的实际 API 契约
    documents.ts          SVG 导入边界、示例文档与导出
    selection.ts          选区属性和图层投影
    shortcuts.ts          快捷键解析
    draft.ts              本机草稿
  lib/                    主题与样式工具
  __tests__/              单元与回归测试
```

React 负责界面；固定版本的 `@svgedit/svgcanvas@7.4.2` 负责 SVG DOM 和撤销历史。界面订阅引擎快照，没有第二份镜像文档 Store。

## 参与贡献

欢迎提交 [Issue](https://github.com/Hello-job/svg-studio/issues) 和 [Pull Request](https://github.com/Hello-job/svg-studio/pulls)。报告问题时请附最小 SVG、复现步骤、浏览器和预期结果；请勿上传敏感作品或凭据。开始前阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [AGENTS.md](AGENTS.md)。

## 许可证与致谢

本项目原创代码使用 [MIT License](LICENSE)。React、SVG-Edit、shadcn/ui、Radix UI、Lucide、DOMPurify、Tailwind CSS 等第三方代码保留各自许可，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

感谢 [SVG-Edit](https://github.com/SVG-Edit/svgedit) 提供编辑引擎，以及 [shadcn/ui](https://github.com/shadcn-ui/ui) 提供可修改的界面基础组件。
