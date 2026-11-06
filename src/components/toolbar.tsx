import {
  MousePointer2,
  GitBranch,
  Pencil,
  Minus,
  PenTool,
  RectangleHorizontal,
  Circle,
  Type,
  Hand,
  Search,
  Pipette,
  Star,
  Hexagon,
  ChevronDown,
} from "lucide-react";
import { IconButton, Menu, MenuItem } from "./controls";
import type { EditorSession } from "../editor/session";
import type { EditorSnapshot, Tool } from "../editor/types";

export function Toolbar({
  session,
  state,
  run,
}: {
  session: EditorSession | null;
  state: EditorSnapshot;
  run(action: () => void): void;
}) {
  const tools = [
    { id: "select", icon: MousePointer2, label: "选择 · V" },
    { id: "pathedit", icon: GitBranch, label: "节点编辑 · A" },
    { id: "fhpath", icon: Pencil, label: "铅笔 · B" },
    { id: "line", icon: Minus, label: "直线 · L" },
    { id: "path", icon: PenTool, label: "钢笔 · P" },
  ] as const;
  const tool = (id: Tool) => run(() => session?.setTool(id));
  return (
    <aside className="tool-rail" aria-label="绘图工具">
      <div className="tool-group">
        {tools.map(({ id, icon, label }) => (
          <IconButton
            key={id}
            icon={icon}
            label={label}
            active={state.tool === id}
            disabled={!session}
            onClick={() => tool(id)}
          />
        ))}
      </div>
      <div className="tool-group">
        <div className="shape-tool">
          <IconButton
            icon={state.tool === "ellipse" ? Circle : RectangleHorizontal}
            label="矩形 · R"
            active={state.tool === "rect" || state.tool === "ellipse"}
            disabled={!session}
            onClick={() => tool("rect")}
          />
          <Menu
            ariaLabel="形状工具"
            className="shape-menu-trigger"
            label={<ChevronDown size={10} />}
          >
            <MenuItem onSelect={() => tool("rect")} shortcut="R">
              <RectangleHorizontal size={15} />
              矩形
            </MenuItem>
            <MenuItem onSelect={() => tool("ellipse")} shortcut="O">
              <Circle size={15} />
              椭圆
            </MenuItem>
            <MenuItem onSelect={() => run(() => session?.addShape("star"))}>
              <Star size={15} />
              星形
            </MenuItem>
            <MenuItem onSelect={() => run(() => session?.addShape("polygon"))}>
              <Hexagon size={15} />
              多边形
            </MenuItem>
          </Menu>
        </div>
        <IconButton
          icon={Type}
          label="文字 · T"
          active={state.tool === "text"}
          disabled={!session}
          onClick={() => tool("text")}
        />
      </div>
      <div className="tool-group">
        <IconButton
          icon={Hand}
          label="平移 · H / 按住空格"
          active={state.tool === "pan"}
          onClick={() => tool("pan")}
        />
        <IconButton
          icon={Search}
          label="缩放 · Z，Alt 点击缩小"
          active={state.tool === "zoom"}
          onClick={() => tool("zoom")}
        />
        <IconButton
          icon={Pipette}
          label="吸管 · I，点击图形取填色"
          active={state.tool === "eyedropper"}
          onClick={() => tool("eyedropper")}
        />
      </div>
      <div className="rail-colors" aria-label="当前绘图颜色">
        <button
          className="rail-stroke"
          aria-label="将描边设为深蓝"
          title="描边色"
          style={{
            backgroundColor:
              state.selected?.stroke === "none"
                ? "transparent"
                : (state.selected?.stroke ?? state.stroke),
          }}
          onClick={() => run(() => session?.setColor("stroke", "#132c50"))}
        />
        <label
          className="rail-fill"
          style={{
            backgroundColor:
              state.selected?.fill === "none"
                ? "transparent"
                : (state.selected?.fill ?? state.fill),
          }}
          title="填充色"
        >
          <input
            type="color"
            aria-label="当前填充颜色"
            value={
              /^#[\da-f]{6}$/i.test(state.selected?.fill ?? state.fill)
                ? (state.selected?.fill ?? state.fill)
                : "#f4a261"
            }
            onChange={(e) =>
              run(() => session?.setColor("fill", e.target.value))
            }
          />
        </label>
      </div>
    </aside>
  );
}
