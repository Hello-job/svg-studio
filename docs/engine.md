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

页面生命周期内保留唯一实例。React 重新渲染不会重建引擎；应用级事件和 ResizeObserver 均有对应清理。上游内部的全局 storage 监听器无法通过公开 API 完整卸载。如果未来需要嵌入弹窗或多个编辑器，必须先解决隔离和销毁，而不是直接复用当前实例初始化方式。

## 导入边界

先按 XML 解析，拒绝破损文档，再将 SVG DOM 交给 DOMPurify。使用 DOM 而非 HTML 字符串解析，可避免 foreignObject/iframe 的 HTML 解析行为吞掉后续有效矢量内容。移除可执行元素与外部资源，保留文档内引用；常用内联外观转成 presentation attributes，保证属性面板修改生效。之后由 SVG-Edit 做其自身格式兼容处理。

相关回归测试位于 `src/__tests__/documents.test.ts`。浏览器实测覆盖真实图形绘制、文字输入、属性修改、导入导出、分组、历史、图层、缩放后尺寸修改与节点编辑。
