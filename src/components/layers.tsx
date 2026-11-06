import { Input } from "./ui/input";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LockKeyholeOpen,
  Square,
  Circle,
  Type,
  Spline,
  Group,
  Copy,
  Plus,
} from "lucide-react";
import { IconButton, Menu, MenuItem } from "./controls";
import type { EditorSession } from "../editor/session";
import type { EditorSnapshot } from "../editor/types";

export function Layers({
  session,
  state,
  run,
}: {
  session: EditorSession;
  state: EditorSnapshot;
  run(action: () => void): void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <section className="layers-panel" aria-label="图层列表">
      <div className="section-heading">
        <h2>图层</h2>
        <Menu ariaLabel="添加对象" label={<Plus size={16} />}>
          <MenuItem onSelect={() => session.setTool("rect")}>绘制矩形</MenuItem>
          <MenuItem onSelect={() => session.setTool("ellipse")}>
            绘制椭圆
          </MenuItem>
          <MenuItem onSelect={() => session.setTool("text")}>添加文字</MenuItem>
          <MenuItem
            onSelect={() => run(() => session.command("duplicate"))}
            disabled={!state.selected}
          >
            复制选中对象
          </MenuItem>
        </Menu>
      </div>
      <div className="layers-list">
        {state.layers.map((layer) => {
          let Icon = Square;
          if (layer.tag === "circle" || layer.tag === "ellipse") Icon = Circle;
          else if (layer.tag === "text") Icon = Type;
          else if (layer.tag === "path") Icon = Spline;
          else if (layer.tag === "g") Icon = Group;
          else if (layer.tag === "use") Icon = Copy;
          return (
            <div
              key={layer.id}
              className={`layer-row${state.selectedIds.includes(layer.id) ? " selected" : ""}${layer.hidden ? " hidden-layer" : ""}`}
              style={{ paddingLeft: 8 + layer.depth * 12 }}
            >
              <button
                className="layer-select"
                title={`${layer.name}（双击名称重命名）`}
                disabled={layer.locked || layer.hidden}
                onClick={(e) => session.select(layer.id, e.shiftKey)}
                onDoubleClick={() => setEditing(layer.id)}
              >
                <Icon size={16} />
                {editing === layer.id ? null : <span>{layer.name}</span>}
              </button>
              {editing === layer.id && (
                <Input
                  autoFocus
                  aria-label="图层名称"
                  className="layer-name-input absolute h-6 w-auto px-1 text-xs"
                  defaultValue={layer.name}
                  onBlur={(e) => {
                    run(() => session.rename(layer.id, e.target.value));
                    setEditing(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
              )}
              <IconButton
                icon={layer.hidden ? EyeOff : Eye}
                label={`${layer.hidden ? "显示" : "隐藏"}${layer.name}`}
                onClick={() =>
                  run(() => session.toggleLayer(layer.id, "visibility"))
                }
              />
              <IconButton
                icon={layer.locked ? LockKeyhole : LockKeyholeOpen}
                label={`${layer.locked ? "解锁" : "锁定"}${layer.name}`}
                onClick={() => run(() => session.toggleLayer(layer.id, "lock"))}
              />
            </div>
          );
        })}
        {state.layers.length === 0 && (
          <p className="empty-layers">用左侧工具绘制第一个图形</p>
        )}
      </div>
    </section>
  );
}
