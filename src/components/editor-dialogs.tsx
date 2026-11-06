import { useState } from "react";
import { Dialog } from "./dialog";
import { NumberField } from "./controls";
import type { EditorSession } from "../editor/session";

export function EditorDialogs({
  dialog,
  setDialog,
  source,
  setSource,
  confirmation,
  setConfirmation,
  session,
  setName,
  fit,
  run,
}: {
  dialog: "source" | "new" | "help" | null;
  setDialog(value: "source" | "new" | "help" | null): void;
  source: string;
  setSource(value: string): void;
  confirmation: { action(): void } | null;
  setConfirmation(value: { action(): void } | null): void;
  session: EditorSession | null;
  setName(value: string): void;
  fit(): void;
  run(action: () => void): void;
}) {
  const [newWidth, setNewWidth] = useState(800),
    [newHeight, setNewHeight] = useState(600);
  return (
    <>
      <Dialog
        open={dialog === "source"}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title="SVG 源码"
        description="编辑矢量内容。应用前会检查格式并移除脚本与外部资源。"
        wide
      >
        <textarea
          className="source-editor"
          aria-label="SVG 源码"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
        />
        <div className="dialog-footer">
          <button className="secondary-button" onClick={() => setDialog(null)}>
            取消
          </button>
          <button
            className="primary-button"
            onClick={() =>
              run(() => {
                session?.load(source);
                setDialog(null);
                fit();
              })
            }
          >
            应用修改
          </button>
        </div>
      </Dialog>
      <Dialog
        open={dialog === "new"}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title="新建画布"
        description="设置 SVG 的画布尺寸，背景默认为透明。"
      >
        <div className="property-row new-size">
          <NumberField
            label="宽度"
            value={newWidth}
            min={1}
            max={20000}
            suffix="px"
            onCommit={setNewWidth}
          />
          <NumberField
            label="高度"
            value={newHeight}
            min={1}
            max={20000}
            suffix="px"
            onCommit={setNewHeight}
          />
        </div>
        <div className="dialog-footer">
          <button className="secondary-button" onClick={() => setDialog(null)}>
            取消
          </button>
          <button
            className="primary-button"
            onClick={() =>
              run(() => {
                session?.newDocument(newWidth, newHeight);
                setName("未命名.svg");
                setDialog(null);
                fit();
              })
            }
          >
            创建画布
          </button>
        </div>
      </Dialog>
      <Dialog
        open={dialog === "help"}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title="键盘快捷键"
        description="Windows / Linux 使用 Ctrl，macOS 使用 ⌘。"
      >
        <div className="shortcut-list">
          {[
            ["选择 / 节点", "V / A"],
            ["铅笔 / 钢笔 / 直线", "B / P / L"],
            ["矩形 / 椭圆 / 文字", "R / O / T"],
            ["平移", "H / 按住空格"],
            ["缩放 / 吸管", "Z / I"],
            ["保存 / 打开", "⌘ S / ⌘ O"],
            ["撤销 / 重做", "⌘ Z / ⇧ ⌘ Z"],
            ["组合 / 取消组合", "⌘ G / ⇧ ⌘ G"],
            ["创建副本", "⌘ D"],
            ["微调 / 快速移动", "方向键 / ⇧ 方向键"],
            ["适合窗口", "Shift 1"],
            ["取消选择", "Esc"],
          ].map(([label, key]) => (
            <div key={label}>
              <span>{label}</span>
              <kbd>{key}</kbd>
            </div>
          ))}
        </div>
      </Dialog>
      <Dialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
        title="替换当前画布？"
        description="当前作品尚未下载保存。继续操作会替换当前内容；你也可以先取消并保存 SVG。"
      >
        <div className="dialog-footer">
          <button
            className="secondary-button"
            onClick={() => setConfirmation(null)}
          >
            取消
          </button>
          <button
            className="primary-button"
            onClick={() => {
              confirmation?.action();
              setConfirmation(null);
            }}
          >
            继续
          </button>
        </div>
      </Dialog>
    </>
  );
}
