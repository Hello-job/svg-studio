import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SvgStudio } from "../components/svg-studio";
import { STUDIO_PROTOCOL } from "../lib/svg-studio-protocol";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

function frame() {
  const iframe = host.querySelector("iframe")!;
  const instance = new URL(iframe.src).searchParams.get("instance");
  const post = vi
    .spyOn(iframe.contentWindow!, "postMessage")
    .mockImplementation(() => {});
  const send = (
    type: string,
    extra: Record<string, unknown> = {},
    origin = "https://editor.example",
  ) => {
    act(() =>
      window.dispatchEvent(
        new MessageEvent("message", {
          source: iframe.contentWindow,
          origin,
          data: { protocol: STUDIO_PROTOCOL, instance, type, ...extra },
        }),
      ),
    );
  };
  return { iframe, instance, post, send };
}

describe("可安装的 SvgStudio 组件", () => {
  it("服务端渲染只输出占位，不访问浏览器引擎", () => {
    const markup = renderToString(
      <SvgStudio editorUrl="https://editor.example/" />,
    );
    expect(markup).toContain("Loading SVG Studio");
    expect(markup).not.toContain("<iframe");
  });
  it("StrictMode 下创建独立实例，握手不泄露跨来源数据", () => {
    const onChange = vi.fn();
    const onSave = vi.fn();
    act(() =>
      root.render(
        <StrictMode>
          <SvgStudio
            editorUrl="https://editor.example/"
            defaultValue="<svg/>"
            onChange={onChange}
            onSave={onSave}
          />
        </StrictMode>,
      ),
    );
    const { iframe, post, send } = frame();
    expect(new URL(iframe.src).searchParams.get("parentOrigin")).toBe(
      window.location.origin,
    );
    send("ready", {}, "https://attacker.example");
    expect(post).not.toHaveBeenCalled();
    send("ready");
    expect(post).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "load",
        svg: "<svg/>",
        interceptSave: true,
      }),
      "https://editor.example",
    );
    const document = { svg: "<svg/>", filename: "untitled.svg" };
    send("loaded", { document });
    expect(host.querySelector('[aria-busy="false"]')).not.toBeNull();
    send("change", { document });
    send("save", { document });
    expect(onChange).toHaveBeenCalledExactlyOnceWith(document.svg, document);
    expect(onSave).toHaveBeenCalledExactlyOnceWith(document);
  });

  it("回显受控值不重载画板；外部新文档通过协议载入", () => {
    const onChange = vi.fn();
    const render = (value: string) =>
      act(() =>
        root.render(
          <SvgStudio
            editorUrl="https://editor.example/"
            value={value}
            onChange={onChange}
          />,
        ),
      );
    render("<svg/>");
    const { post, send } = frame();
    send("ready");
    send("loaded", {
      document: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg"/>',
        filename: "untitled.svg",
      },
    });
    expect(post).toHaveBeenCalledTimes(1);
    const edited = "<svg><rect/></svg>";
    send("change", { document: { svg: edited, filename: "untitled.svg" } });
    render(edited);
    expect(post).toHaveBeenCalledTimes(1);
    render("<svg><circle/></svg>");
    expect(post).toHaveBeenCalledWith(
      expect.objectContaining({ type: "value", svg: "<svg><circle/></svg>" }),
      "https://editor.example",
    );
  });
});
