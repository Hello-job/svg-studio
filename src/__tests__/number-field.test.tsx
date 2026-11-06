import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { NumberField } from "../components/controls";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
function edit(value: string) {
  const input = host.querySelector("input")!;
  act(() => {
    input.focus();
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  return input;
}

describe("数值字段提交", () => {
  it("Escape 取消输入，不会因 blur 意外写入文档", () => {
    const commit = vi.fn();
    act(() =>
      root.render(<NumberField label="宽度" value={100} onCommit={commit} />),
    );
    const input = edit("200");
    act(() =>
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(commit).not.toHaveBeenCalled();
    expect(input.value).toBe("100");
  });
  it("Enter 只提交一次有效数值", () => {
    const commit = vi.fn();
    act(() =>
      root.render(
        <NumberField label="宽度" value={100} min={1} onCommit={commit} />,
      ),
    );
    const input = edit("240");
    act(() =>
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      ),
    );
    expect(commit).toHaveBeenCalledExactlyOnceWith(240);
  });
});
