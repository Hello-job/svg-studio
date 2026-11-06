# 参与 SVG Studio 开发

SVG Studio 当前处于实验阶段，欢迎修复问题、补充兼容性样例和改进编辑体验。优先事项见[已知问题](docs/known-issues.md)。

## 提交问题

在 [GitHub Issues](https://github.com/Hello-job/svg-studio/issues) 中提供：

- 浏览器、操作系统和所用版本或 commit。
- 最小复现 SVG 与操作步骤。
- 预期结果和实际结果，必要时附截图。
- 是否涉及导入、缩放、多选、撤销/重做或刷新恢复。

请先删除样例中的个人信息、商业素材和凭据。对于可能执行脚本或请求外部资源的样例，请用代码块描述，不要诱导其他人打开可执行内容。

## 本地准备

```sh
git clone https://github.com/Hello-job/svg-studio.git
cd svg-studio
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

请使用 Node.js 22.12+（推荐 24）和项目固定的 pnpm 版本。Fork 后从自己的分支提交 PR；一次改动尽量解决一个明确的问题。

## 关键约束

开始前阅读 [AGENTS.md](AGENTS.md) 和 [docs/engine.md](docs/engine.md)。

- React 管理界面，SVG-Edit 管理 SVG DOM 和撤销历史，不建立第二份镜像文档 Store。
- 页面只初始化一个引擎实例，不通过 StrictMode 或反复挂载假设引擎已经正确销毁。
- 引擎版本固定为 7.4.2。升级时重新核对实际源码、API 契约和生命周期。
- 使用 TypeScript strict，不引入显式 `any` 或关闭类型检查。
- 使用语义颜色变量，保留默认黑白深色和紧凑界面。
- 外部 SVG 只在导入边界清理；不要为兼容性允许脚本或外部资源执行。
- 测试放在 `src/__tests__/`。修复时补能够证明问题的回归场景。
- 不提交 `node_modules/`、`dist/`、环境配置、缓存或个人作品。

## 提交前检查

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

界面或引擎改动还需要浏览器验证：编辑真实对象、撤销/重做、下载 SVG/PNG，以及改动涉及的导入、缩放或草稿流程。构建成功不能代替交互验证。

PR 描述请说明具体问题、改动后行为、验证方式与已知限制。涉及界面时附不含个人作品的截图。文档或功能行为改变时同步更新 README 和已知问题。

## 许可证

项目原创代码使用 [MIT License](LICENSE)。请仅提交你有权贡献的代码与素材，保留第三方代码的作者和许可证信息；新增依赖时更新第三方说明。
