import { describe, expect, it } from "vitest";
import { shortcutFor } from "../editor/shortcuts";
const key = (key: string, extra = {}) => ({
  key,
  code: "",
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...extra,
});
describe("快捷键分派", () => {
  it("工具切换与系统复制粘贴正确区分", () => {
    expect(shortcutFor(key("v"))).toEqual({ kind: "tool", value: "select" });
    expect(shortcutFor(key("v", { ctrlKey: true }))).toEqual({
      kind: "command",
      value: "paste",
    });
    expect(shortcutFor(key("o", { metaKey: true }))).toEqual({
      kind: "file",
      value: "open",
    });
  });
  it("支持 Windows 和 macOS 的撤销、重做与取消组合", () => {
    expect(shortcutFor(key("z", { ctrlKey: true }))).toEqual({
      kind: "command",
      value: "undo",
    });
    expect(shortcutFor(key("Z", { metaKey: true, shiftKey: true }))).toEqual({
      kind: "command",
      value: "redo",
    });
    expect(shortcutFor(key("G", { ctrlKey: true, shiftKey: true }))).toEqual({
      kind: "command",
      value: "ungroup",
    });
  });
  it("Shift 1 使用物理键码，兼容不同键盘布局", () => {
    expect(shortcutFor(key("!", { code: "Digit1", shiftKey: true }))).toEqual({
      kind: "file",
      value: "fit",
    });
    expect(shortcutFor(key("r", { altKey: true }))).toBeNull();
  });
});
