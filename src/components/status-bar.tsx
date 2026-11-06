import { Maximize, Minus, Plus, Monitor } from "lucide-react";
import { IconButton } from "./controls";
import { NativeSelect } from "./ui/native-select";
import type { EditorSession } from "../editor/session";
import type { EditorSnapshot } from "../editor/types";

export function StatusBar({
  session,
  state,
  fit,
  run,
}: {
  session: EditorSession | null;
  state: EditorSnapshot;
  fit(): void;
  run(action: () => void): void;
}) {
  const colors = [
    "#faf6ee",
    "#f4a261",
    "#132c50",
    "#f0e7d8",
    "#e8d9bf",
    "#8ba4a0",
    "#f5f5f5",
    "#202020",
  ];
  return (
    <footer className="status-bar">
      <button
        className="canvas-size"
        onClick={() => session?.canvas.clearSelection()}
        title="取消选择以编辑画布尺寸"
      >
        <Monitor size={17} />
        <span>
          {Math.round(state.width)} × {Math.round(state.height)}
        </span>
      </button>
      <span className="header-divider" />
      <div className="quick-palette" aria-label="快捷色板">
        {colors.map((color) => (
          <button
            key={color}
            aria-label={`填充 ${color}`}
            title={color.toUpperCase()}
            style={{ backgroundColor: color }}
            onClick={() => run(() => session?.setColor("fill", color))}
          />
        ))}
        <label className="palette-custom" title="自定义填充颜色">
          <Plus size={16} />
          <input
            type="color"
            aria-label="自定义填充颜色"
            onChange={(e) =>
              run(() => session?.setColor("fill", e.target.value))
            }
          />
        </label>
      </div>
      <span className="status-hint">
        {state.selectedIds.length > 1
          ? `已选 ${state.selectedIds.length} 个对象`
          : "Shift 多选 · 空格平移"}
      </span>
      <div className="zoom-controls">
        <IconButton
          icon={Minus}
          label="缩小"
          disabled={state.zoom <= 0.1}
          onClick={() => session?.zoomTo(state.zoom / 1.2)}
        />
        <NativeSelect
          size="sm"
          className="h-7 w-[76px] border-0 bg-transparent pl-2 pr-7 text-xs shadow-none dark:bg-transparent"
          aria-label="缩放比例"
          value={state.zoom}
          onChange={(e) => session?.zoomTo(Number(e.target.value))}
        >
          {[...new Set([0.25, 0.5, 0.75, 1, 1.5, 2, 4, state.zoom])]
            .sort((a, b) => a - b)
            .map((zoom) => (
              <option value={zoom} key={zoom}>
                {Math.round(zoom * 100)}%
              </option>
            ))}
        </NativeSelect>
        <IconButton
          icon={Plus}
          label="放大"
          disabled={state.zoom >= 8}
          onClick={() => session?.zoomTo(state.zoom * 1.2)}
        />
        <span className="header-divider" />
        <IconButton icon={Maximize} label="适合窗口 · Shift 1" onClick={fit} />
      </div>
    </footer>
  );
}
