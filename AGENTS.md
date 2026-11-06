# SVG Studio 开发约定

- 这是独立的 React + Vite + TypeScript 编辑器，使用 pnpm；不依赖 Tamen 项目或任何后端。
- 改动前阅读 README、`docs/engine.md` 和相关实现，保留已有工作区改动。
- React 管理界面；SVG-Edit 管理画板 DOM 和历史。不要创建第二份镜像文档 Store，也不要把画板内容替换为截图。
- `src/editor/types.ts` 描述固定引擎版本的实际方法；升级引擎时重新核对源码与生命周期。
- 页面只创建一个引擎实例。当前不能通过添加 StrictMode、反复初始化或直接删除容器来假定已安全销毁。
- 通用样式使用 `src/styles.css` 的语义变量，保留紧凑的深色工作区；默认文字 14px，密集字段和辅助信息可使用 12–13px。
- 外部 SVG 仅在文件/草稿入口做清理；新增支持的 SVG 能力时补导入回归测试，不能放开脚本或外部资源执行。
- TypeScript strict，不使用显式 any 或关闭类型检查。中文注释说明原因，不解释每行代码。
- 测试放在 `src/__tests__/`；修改后先验证相关场景，再运行 typecheck、lint、format:check、test 和 build。
- UI 变更还需要浏览器验证，覆盖编辑、历史和导出，不用构建成功代替交互验证。
- 不提交 node_modules、dist、环境配置、构建缓存或用户文档。不得未经明确指令部署公开站点。
