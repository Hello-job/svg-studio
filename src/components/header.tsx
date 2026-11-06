import {
  Download,
  Upload,
  Undo2,
  Redo2,
  PanelRight,
  CircleHelp,
  Code2,
} from "lucide-react";
import { IconButton, Menu, MenuItem, MenuSeparator } from "./controls";
import type { EditorSession } from "../editor/session";
import type { Command, EditorSnapshot } from "../editor/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ThemeSettings } from "./theme-settings";

export interface FileActions {
  open(): void;
  save(): void;
  png(): void;
  newDocument(): void;
  source(): void;
  help(): void;
  fit(): void;
}
export function Header({
  embedded = false,
  session,
  state,
  name,
  setName,
  actions,
  run,
  rulers,
  setRulers,
  checker,
  setChecker,
  inspector,
  setInspector,
}: {
  embedded?: boolean;
  session: EditorSession | null;
  state: EditorSnapshot;
  name: string;
  setName(value: string): void;
  actions: FileActions;
  run(action: () => void): void;
  rulers: boolean;
  setRulers(value: boolean): void;
  checker: boolean;
  setChecker(value: boolean): void;
  inspector: boolean;
  setInspector(value: boolean): void;
}) {
  const command = (id: Command) => run(() => session?.command(id));
  const selected = state.selectedIds.length > 0;
  const modifiedStatus = embedded ? "已修改" : "已修改 · 草稿保存在本机";
  return (
    <>
      <header className="app-header">
        <Input
          className="document-name h-8 w-[230px] border-transparent bg-transparent shadow-none hover:border-input max-sm:w-[120px] max-sm:flex-1 dark:bg-transparent"
          aria-label="文件名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (!name.trim()) setName("未命名.svg");
          }}
        />
        <div className="header-actions">
          {!embedded && (
            <Button variant="ghost" size="icon-sm" asChild>
              <a
                href={`${import.meta.env.BASE_URL}install.html`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="安装 React 组件"
                title="安装 React 组件"
              >
                <Code2 />
              </a>
            </Button>
          )}
          <ThemeSettings persist={!embedded} />
          <Button
            variant="outline"
            size="sm"
            className="import-button hidden sm:inline-flex"
            onClick={actions.open}
            disabled={!session}
          >
            <Upload size={16} />
            <span>导入</span>
          </Button>
          <Menu
            label={
              <>
                <Download size={16} />
                <span>导出</span>
              </>
            }
            className="export-trigger"
          >
            <MenuItem onSelect={actions.save}>SVG 矢量文件</MenuItem>
            <MenuItem onSelect={actions.png}>PNG 图片</MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={actions.source}>查看 / 编辑 SVG 源码</MenuItem>
          </Menu>
          <Button
            size="sm"
            className="primary-button"
            onClick={actions.save}
            disabled={!session}
          >
            <Download size={16} />
            <span>保存 SVG</span>
          </Button>
        </div>
      </header>
      <nav className="menu-bar" aria-label="编辑器菜单">
        <div className="main-menus">
          <Menu label="文件">
            <MenuItem onSelect={actions.newDocument} shortcut="⌘ N">
              新建画布
            </MenuItem>
            <MenuItem onSelect={actions.open} shortcut="⌘ O">
              打开 SVG…
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={actions.save} shortcut="⌘ S">
              保存 SVG
            </MenuItem>
            <MenuItem onSelect={actions.png}>导出 PNG</MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={actions.source}>SVG 源码…</MenuItem>
          </Menu>
          <Menu label="编辑">
            <MenuItem
              onSelect={() => command("undo")}
              disabled={!state.canUndo}
              shortcut="⌘ Z"
            >
              撤销
            </MenuItem>
            <MenuItem
              onSelect={() => command("redo")}
              disabled={!state.canRedo}
              shortcut="⇧ ⌘ Z"
            >
              重做
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              onSelect={() => command("cut")}
              disabled={!selected}
              shortcut="⌘ X"
            >
              剪切
            </MenuItem>
            <MenuItem
              onSelect={() => command("copy")}
              disabled={!selected}
              shortcut="⌘ C"
            >
              复制
            </MenuItem>
            <MenuItem onSelect={() => command("paste")} shortcut="⌘ V">
              粘贴
            </MenuItem>
            <MenuItem
              onSelect={() => command("duplicate")}
              disabled={!selected}
              shortcut="⌘ D"
            >
              创建副本
            </MenuItem>
            <MenuItem onSelect={() => command("select-all")} shortcut="⌘ A">
              全选
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              onSelect={() => command("delete")}
              disabled={!selected}
              shortcut="⌫"
              danger
            >
              删除
            </MenuItem>
          </Menu>
          <Menu label="对象">
            <MenuItem
              onSelect={() => command("group")}
              disabled={state.selectedIds.length < 2}
              shortcut="⌘ G"
            >
              组合
            </MenuItem>
            <MenuItem
              onSelect={() => command("ungroup")}
              disabled={state.selected?.tag !== "g"}
              shortcut="⇧ ⌘ G"
            >
              取消组合
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => command("front")} disabled={!selected}>
              置于顶层
            </MenuItem>
            <MenuItem onSelect={() => command("raise")} disabled={!selected}>
              上移一层
            </MenuItem>
            <MenuItem onSelect={() => command("lower")} disabled={!selected}>
              下移一层
            </MenuItem>
            <MenuItem onSelect={() => command("back")} disabled={!selected}>
              置于底层
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => command("flip-x")} disabled={!selected}>
              水平翻转
            </MenuItem>
            <MenuItem onSelect={() => command("flip-y")} disabled={!selected}>
              垂直翻转
            </MenuItem>
            <MenuItem onSelect={() => command("to-path")} disabled={!selected}>
              转换为路径
            </MenuItem>
          </Menu>
          <Menu label="视图">
            <MenuItem onSelect={actions.fit} shortcut="⇧ 1">
              适合窗口
            </MenuItem>
            <MenuItem onSelect={() => session?.zoomTo(1)} shortcut="⌘ 0">
              实际大小 100%
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => setRulers(!rulers)}>
              {rulers ? "隐藏标尺" : "显示标尺"}
            </MenuItem>
            <MenuItem onSelect={() => setChecker(!checker)}>
              {checker ? "隐藏透明网格" : "显示透明网格"}
            </MenuItem>
            <MenuItem onSelect={() => setInspector(!inspector)}>
              {inspector ? "隐藏属性面板" : "显示属性面板"}
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={actions.help}>键盘快捷键…</MenuItem>
          </Menu>
        </div>
        <span className="header-divider" />
        <div className="history-actions">
          <IconButton
            icon={Undo2}
            label="撤销 · ⌘ Z"
            disabled={!state.canUndo}
            onClick={() => command("undo")}
          />
          <IconButton
            icon={Redo2}
            label="重做 · ⇧ ⌘ Z"
            disabled={!state.canRedo}
            onClick={() => command("redo")}
          />
        </div>
        <span className="save-status">
          <span
            className={state.dirty ? "status-dot modified" : "status-dot"}
          />
          {state.dirty ? modifiedStatus : "就绪"}
        </span>
        <div className="menu-end">
          <IconButton
            icon={CircleHelp}
            label="键盘快捷键"
            className="max-sm:hidden"
            onClick={actions.help}
          />
          <IconButton
            icon={PanelRight}
            label="切换属性面板"
            active={inspector}
            onClick={() => setInspector(!inspector)}
          />
        </div>
      </nav>
    </>
  );
}
