# SVG-Edit 接入说明

当前固定使用 `@svgedit/svgcanvas@7.4.2`。React 拥有界面和一个空画板容器，SVG-Edit 拥有该容器内的 SVG DOM、选区和撤销栈。界面通过 `useSyncExternalStore` 订阅 `EditorSession` 的不可变快照，没有另建文档数据副本。

## 实际 API 与声明差异

上游 `.d.ts` 包含没有实际实现的 `SvgCanvas.undo()`、`redo()` 和 `unbind()`。本项目通过 `undoMgr.undo()` 和 `undoMgr.redo()` 调用真实历史管理器。`types.ts` 是已核对该固定版本源码的适配契约，不将上游的 `any` 传播到界面。

`selected`、`changed` 等 `bind` 回调每种事件只保留一个处理函数，回调参数为 `(window, payload)`，不能按 DOM 的多监听器事件模型使用。

## 缩放与序列化

引擎将 SVG 内容的 `width/height` 作为缩放后的显示尺寸，`getResolution()` 再除以 zoom 得到文档尺寸。布局必须同步 root 和 content 的尺寸；内置 `canvasBackground` 不会自动跟随自定义布局，已由工作区背景替代。

修改尺寸、打开文件及历史回放时需要区分显示尺寸和文档尺寸。打开文件前先归一化现有缩放，避免撤销导入时恢复错误的尺寸。回放历史在 100% 的文档坐标下进行，再恢复当前视图缩放。

草稿和下载通过克隆 SVG 内容序列化，并恢复文档尺寸、移除编辑器根属性。没有使用会清理当前路径编辑状态的 `getSvgString()` 保存草稿。

## 绘图与选区

引擎在部分绘制操作完成后会自动切换为选择工具，界面快照需要同步其实际模式。节点编辑使用 `pathActions.toEditMode()` 进入；该方法会清空普通对象选区，因此节点操作面板不依赖普通选区是否存在。

从对象切换到绘图工具时，补齐上游可能置为 null 的绘图外观。线条和铅笔默认使用可见描边，避免产生有路径却不可见的对象。

对象锁定使用文档内的 `data-locked` 属性，工作区阻止指针选取，并过滤框选命中的锁定对象。显隐、锁定、重命名都写入引擎的撤销历史。

## 生命周期

每个浏览器文档生命周期内保留唯一实例。React 重新渲染不会重建引擎；应用级事件和 ResizeObserver 均有对应清理。上游内部的全局 storage 监听器无法通过公开 API 完整卸载，不能在同一个文档内直接反复挂载原生 `App`。对外的 `SvgStudio` 组件使用独立 iframe，每个实例有自己的 document/window；卸载时由浏览器销毁整个环境，支持弹窗开关和多个组件。

开发时修改组件的 Hook 结构可能让 Fast Refresh 重新挂载画板容器，已有引擎则仍引用原容器；此时需要刷新页面，从本机草稿重新载入。生产版的普通交互不会重新挂载该容器。

选区投影通过逐项相乘读取 transform，不调用会改写原始 SVGTransformList 的 `consolidate()`。旋转按当前矩阵的实际角度计算，并以中心点施加角度差，避免移动或缩放后再次旋转出现角度叠加。

## 导入边界

先按 XML 解析，拒绝破损文档，再将 SVG DOM 交给 DOMPurify。使用 DOM 而非 HTML 字符串解析，可避免 foreignObject/iframe 的 HTML 解析行为吞掉后续有效矢量内容。移除可执行元素与外部资源，保留文档内引用；常用内联外观转成 presentation attributes，保证属性面板修改生效。之后由 SVG-Edit 做其自身格式兼容处理。

相关回归测试位于 `src/__tests__/documents.test.ts`。浏览器实测覆盖真实图形绘制、文字输入、属性修改、导入导出、分组、历史、图层、缩放后尺寸修改与节点编辑。

## shadcn Registry 与宿主通信

`registry.json` 分发 `SvgStudio` 和 `svg-studio-protocol` 两份源码，`pnpm registry:build` 通过官方 shadcn CLI 生成 `public/r/svg-studio.json`，构建时自动同步。宿主项目需要 React 18+、Tailwind CSS 和已初始化的 shadcn/ui；编辑器完整界面源码仍在此仓库，`editorUrl` 可指向自有部署。

组件支持 `defaultValue`、`value / onChange`、初始 `filename`、`onReady`、`onSave` 和 `onError`，样式可通过 `className / style` 配置，默认高度 720px，最小 440px。`value` 从外部替换时重置该文档的历史；宿主回显 `onChange` 结果不会重载画板。未提供初始内容时显示示例，空字符串创建空白画布。

握手使用版本化消息和每个 iframe 的随机实例 ID，双方同时校验 `event.origin`、`event.source` 与实例。消息不使用通配符目标来源；初始握手前只发送就绪信号。宿主传入的 SVG 仍经过 `EditorSession.load` 的导入清理，消息限制 5 MB。`onReady` 返回清理后的初始文档；引擎通知经 200ms 防抖后读取实际 SVG 回传 `onChange`，包括未增加 revision 的属性修改，不建立另一份可写文档 Store。

嵌入模式不读写本机草稿，不继承或持久化主题偏好。提供 `onSave` 时，保存按钮发送 `{ svg, filename }` 给宿主，否则仍然下载 SVG；PNG 导出保持下载行为。接入后宿主负责业务保存和离开提示。跨来源传递仅发生在浏览器窗口之间，部署服务不接收 SVG 内容。
