import type { Command, Tool } from "./types";

export type Shortcut =
  | { kind: "command"; value: Command }
  | { kind: "tool"; value: Tool }
  | { kind: "file"; value: "save" | "open" | "newDocument" | "fit" | "actual" };
export function shortcutFor(
  event: Pick<
    KeyboardEvent,
    "key" | "code" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey"
  >,
): Shortcut | null {
  if (event.altKey) return null;
  const key = event.key.toLowerCase();
  if (event.metaKey || event.ctrlKey) {
    if (key === "s") return { kind: "file", value: "save" };
    if (key === "o") return { kind: "file", value: "open" };
    if (key === "n") return { kind: "file", value: "newDocument" };
    if (key === "0") return { kind: "file", value: "actual" };
    if (key === "z")
      return { kind: "command", value: event.shiftKey ? "redo" : "undo" };
    if (key === "y") return { kind: "command", value: "redo" };
    if (key === "g")
      return { kind: "command", value: event.shiftKey ? "ungroup" : "group" };
    const commands: Record<string, Command> = {
      a: "select-all",
      c: "copy",
      x: "cut",
      v: "paste",
      d: "duplicate",
    };
    return commands[key] ? { kind: "command", value: commands[key] } : null;
  }
  if (event.shiftKey && event.code === "Digit1")
    return { kind: "file", value: "fit" };
  if (key === "delete" || key === "backspace")
    return { kind: "command", value: "delete" };
  if (event.shiftKey) return null;
  const tools: Record<string, Tool> = {
    v: "select",
    a: "pathedit",
    b: "fhpath",
    l: "line",
    p: "path",
    r: "rect",
    o: "ellipse",
    t: "text",
    h: "pan",
    z: "zoom",
    i: "eyedropper",
  };
  return tools[key] ? { kind: "tool", value: tools[key] } : null;
}
