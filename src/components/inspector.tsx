import { useState } from "react";
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  FlipHorizontal2,
  FlipVertical2,
  LockKeyhole,
  LockKeyholeOpen,
  Bold,
  Italic,
  MoreHorizontal,
  PanelRightClose,
} from "lucide-react";
import {
  ColorField,
  IconButton,
  Menu,
  MenuItem,
  NumberField,
  Select,
} from "./controls";
import { Layers } from "./layers";
import { PathProperties } from "./path-properties";
import type { EditorSession } from "../editor/session";
import type { EditorSnapshot } from "../editor/types";

export function Inspector({
  session,
  state,
  run,
  close,
}: {
  session: EditorSession;
  state: EditorSnapshot;
  run(action: () => void): void;
  close(): void;
}) {
  const [relative, setRelative] = useState("page");
  const [locked, setLocked] = useState(false);
  const selected = state.selected;
  const single = state.selectedIds.length === 1;
  const property = (name: string, value: number) =>
    run(() => session.property(name, value, locked));
  const alignments = [
    { id: "l", icon: AlignStartVertical, label: "左对齐" },
    { id: "c", icon: AlignCenterVertical, label: "水平居中" },
    { id: "r", icon: AlignEndVertical, label: "右对齐" },
    { id: "t", icon: AlignStartHorizontal, label: "顶部对齐" },
    { id: "m", icon: AlignCenterHorizontal, label: "垂直居中" },
    { id: "b", icon: AlignEndHorizontal, label: "底部对齐" },
  ];
  return (
    <aside className="inspector" aria-label="属性面板">
      <div className="inspector-title">
        <h1>
          {selected ? selected.label : "画布"}
          {state.selectedIds.length > 1 && (
            <span className="muted"> · {state.selectedIds.length} 个对象</span>
          )}
        </h1>
        <div className="inspector-title-actions">
          <Menu ariaLabel="对象更多操作" label={<MoreHorizontal size={17} />}>
            <MenuItem onSelect={() => session.canvas.clearSelection()}>
              取消选择
            </MenuItem>
            <MenuItem
              onSelect={() => run(() => session.command("duplicate"))}
              disabled={!selected}
            >
              复制对象
            </MenuItem>
            <MenuItem
              onSelect={() => run(() => session.command("delete"))}
              disabled={!selected}
              danger
            >
              删除对象
            </MenuItem>
          </Menu>
          <span className="mobile-only">
            <IconButton
              icon={PanelRightClose}
              label="收起属性面板"
              onClick={close}
            />
          </span>
        </div>
      </div>
      <div className="property-scroll">
        {state.tool === "pathedit" && (
          <PathProperties session={session} run={run} />
        )}
        {selected ? (
          <>
            <section className="property-section">
              <div className="section-heading">
                <h2>变换</h2>
              </div>
              <div className="dimensions-grid">
                <NumberField
                  label="X"
                  value={selected.x}
                  onCommit={(v) => property("x", v)}
                  disabled={!single}
                />
                <NumberField
                  label="Y"
                  value={selected.y}
                  onCommit={(v) => property("y", v)}
                  disabled={!single}
                />
                <NumberField
                  label="W"
                  value={selected.width}
                  min={0.1}
                  onCommit={(v) => property("width", v)}
                  disabled={!single}
                />
                <NumberField
                  label="H"
                  value={selected.height}
                  min={0.1}
                  onCommit={(v) => property("height", v)}
                  disabled={!single}
                />
              </div>
              <div className="property-row rotation-row">
                <NumberField
                  label="旋转"
                  value={selected.rotation}
                  suffix="°"
                  onCommit={(v) => property("rotation", v)}
                  disabled={!single}
                />
                <IconButton
                  icon={locked ? LockKeyhole : LockKeyholeOpen}
                  label="锁定宽高比例"
                  active={locked}
                  onClick={() => setLocked(!locked)}
                />
                <IconButton
                  icon={FlipHorizontal2}
                  label="水平翻转"
                  onClick={() => run(() => session.command("flip-x"))}
                />
                <IconButton
                  icon={FlipVertical2}
                  label="垂直翻转"
                  onClick={() => run(() => session.command("flip-y"))}
                />
              </div>
              <div className="property-row">
                <NumberField
                  label="圆角"
                  value={selected.radius}
                  min={0}
                  onCommit={(v) => property("radius", v)}
                  disabled={selected.tag !== "rect" || !single}
                />
                <NumberField
                  label="透明度"
                  value={selected.opacity}
                  min={0}
                  max={100}
                  suffix="%"
                  onCommit={(v) => property("opacity", v)}
                />
              </div>
            </section>
            <section className="property-section">
              <div className="section-heading">
                <h2>对齐</h2>
                <Select
                  label="对齐参照"
                  value={relative}
                  onChange={setRelative}
                >
                  <option value="page">相对画布</option>
                  <option value="selected">相对选区</option>
                </Select>
              </div>
              <div className="alignment-row">
                {alignments.map((item) => (
                  <IconButton
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => run(() => session.align(item.id, relative))}
                  />
                ))}
              </div>
              {state.selectedIds.length >= 3 && (
                <div className="distribute-row">
                  <button
                    className="text-button"
                    onClick={() => run(() => session.align("dh", relative))}
                  >
                    水平分布
                  </button>
                  <button
                    className="text-button"
                    onClick={() => run(() => session.align("dv", relative))}
                  >
                    垂直分布
                  </button>
                </div>
              )}
            </section>
            <section className="property-section appearance-section">
              <div className="section-heading">
                <h2>外观</h2>
              </div>
              <ColorField
                label="填充"
                value={selected.fill}
                onCommit={(v) => run(() => session.setColor("fill", v))}
              />
              <ColorField
                label="描边"
                value={selected.stroke}
                onCommit={(v) => run(() => session.setColor("stroke", v))}
              />
              <div className="stroke-settings">
                <NumberField
                  label="宽度"
                  value={selected.strokeWidth}
                  min={0}
                  suffix="px"
                  onCommit={(v) => property("strokeWidth", v)}
                />
                <Select
                  label="描边线型"
                  value={selected.dash}
                  onChange={(v) =>
                    run(() => session.attribute("stroke-dasharray", v))
                  }
                >
                  <option value="none">实线</option>
                  <option value="8,4">虚线</option>
                  <option value="2,4">点线</option>
                  <option value="12,4,2,4">点划线</option>
                </Select>
              </div>
              <details className="disclosure">
                <summary>描边高级</summary>
                <div className="advanced-fields">
                  <label>
                    端点
                    <Select
                      label="描边端点"
                      value={selected.linecap}
                      onChange={(v) =>
                        run(() => session.attribute("stroke-linecap", v))
                      }
                    >
                      <option value="butt">平头</option>
                      <option value="round">圆头</option>
                      <option value="square">方头</option>
                    </Select>
                  </label>
                  <label>
                    连接
                    <Select
                      label="描边连接"
                      value={selected.linejoin}
                      onChange={(v) =>
                        run(() => session.attribute("stroke-linejoin", v))
                      }
                    >
                      <option value="miter">尖角</option>
                      <option value="round">圆角</option>
                      <option value="bevel">斜角</option>
                    </Select>
                  </label>
                </div>
              </details>
              <details className="disclosure">
                <summary>
                  效果
                  <span className="summary-value">
                    模糊 {Math.round(selected.blur)}
                  </span>
                </summary>
                <div className="advanced-fields">
                  <NumberField
                    label="模糊"
                    value={selected.blur}
                    min={0}
                    max={100}
                    onCommit={(v) => property("blur", v)}
                  />
                </div>
              </details>
            </section>
            {selected.tag === "text" && (
              <section className="property-section">
                <div className="section-heading">
                  <h2>文字</h2>
                </div>
                <textarea
                  aria-label="文字内容"
                  key={selected.id + ":" + selected.text}
                  defaultValue={selected.text}
                  rows={2}
                  onBlur={(e) => run(() => session.setText(e.target.value))}
                />
                <Select
                  label="字体"
                  value={selected.fontFamily}
                  onChange={(v) => run(() => session.setFont(v))}
                >
                  <option value={selected.fontFamily}>
                    {selected.fontFamily}
                  </option>
                  {[
                    "Arial, sans-serif",
                    "Georgia, serif",
                    "monospace",
                    "system-ui",
                  ]
                    .filter((font) => font !== selected.fontFamily)
                    .map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                </Select>
                <div className="property-row">
                  <NumberField
                    label="字号"
                    value={selected.fontSize}
                    min={1}
                    onCommit={(v) => property("fontSize", v)}
                  />
                  <IconButton
                    icon={Bold}
                    label="粗体"
                    active={selected.bold}
                    onClick={() =>
                      run(() => session.canvas.setBold(!selected.bold))
                    }
                  />
                  <IconButton
                    icon={Italic}
                    label="斜体"
                    active={selected.italic}
                    onClick={() =>
                      run(() => session.canvas.setItalic(!selected.italic))
                    }
                  />
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="property-section">
            <div className="section-heading">
              <h2>画布尺寸</h2>
            </div>
            <div className="property-row">
              <NumberField
                label="宽度"
                value={state.width}
                min={1}
                max={20000}
                onCommit={(v) => run(() => session.resize(v, state.height))}
              />
              <NumberField
                label="高度"
                value={state.height}
                min={1}
                max={20000}
                onCommit={(v) => run(() => session.resize(state.width, v))}
              />
            </div>
            <p className="inspector-hint">
              选择图形以编辑属性，或使用左侧工具开始绘制。
            </p>
            <p className="inspector-hint">
              Shift 多选 · 空格平移
              <br />⌘ / Ctrl + S 保存 SVG
            </p>
          </section>
        )}
      </div>
      <Layers session={session} state={state} run={run} />
    </aside>
  );
}
