import { afterEach, describe, expect, it, vi } from "vitest";
import { connectEmbed } from "../editor/embed";
import {
  isHostMessage,
  isStudioMessage,
  STUDIO_PROTOCOL,
} from "../lib/svg-studio-protocol";

const context = { origin: "https://host.example", instance: "test-instance" };
const envelope = { protocol: STUDIO_PROTOCOL, instance: context.instance };

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function fixture() {
  let svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>';
  let filename = "test.svg";
  let subscriber = () => {};
  const session = {
    serialize: () => svg,
    load: vi.fn((value: string) => {
      svg = value;
      subscriber();
    }),
    subscribe: (listener: () => void) => {
      subscriber = listener;
      return () => {
        subscriber = () => {};
        return true;
      };
    },
  };
  const post = vi.spyOn(window, "postMessage").mockImplementation(() => {});
  const bridge = connectEmbed(context, session, {
    getFilename: () => filename,
    setFilename: (value) => {
      filename = value;
    },
    fit: vi.fn(),
  });
  const message = (
    data: unknown,
    origin = context.origin,
    source: Window = window,
  ) => {
    window.dispatchEvent(new MessageEvent("message", { data, origin, source }));
  };
  return {
    session,
    post,
    bridge,
    message,
    change: (value: string) => {
      svg = value;
      subscriber();
    },
  };
}

describe("嵌入消息边界", () => {
  it("验证消息结构、协议版本及 SVG 大小", () => {
    expect(
      isHostMessage({
        ...envelope,
        type: "value",
        filename: "x.svg",
        svg: "<svg/>",
      }),
    ).toBe(true);
    expect(
      isHostMessage({
        ...envelope,
        type: "value",
        filename: "x.svg",
        svg: "x".repeat(5_000_001),
      }),
    ).toBe(false);
    expect(
      isHostMessage({ ...envelope, protocol: "unknown", type: "connect" }),
    ).toBe(false);
    expect(
      isStudioMessage({
        ...envelope,
        type: "change",
        document: { svg: 42, filename: "x.svg" },
      }),
    ).toBe(false);
  });

  it("初始化前不发送文档，拒绝错误来源和实例", () => {
    const { session, post, bridge, message } = fixture();
    const request = {
      ...envelope,
      type: "load",
      svg: "<svg/>",
      filename: "new.svg",
      interceptSave: true,
    };
    expect(bridge.save({ svg: "private", filename: "private.svg" })).toBe(
      false,
    );
    expect(post).toHaveBeenCalledExactlyOnceWith(
      { ...envelope, type: "ready" },
      context.origin,
    );
    message(request, "https://other.example");
    message({ ...request, instance: "other" });
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    message(request, context.origin, iframe.contentWindow!);
    expect(session.load).not.toHaveBeenCalled();
    message(request);
    expect(session.load).toHaveBeenCalledExactlyOnceWith("<svg/>", true);
    expect(bridge.save({ svg: "<svg/>", filename: "new.svg" })).toBe(true);
    bridge.dispose();
    iframe.remove();
  });

  it("从引擎读取实际内容，属性变化也会回传，选区变化不重复回传", () => {
    vi.useFakeTimers();
    const { post, bridge, message, change } = fixture();
    message({
      ...envelope,
      type: "load",
      filename: "new.svg",
      interceptSave: false,
    });
    post.mockClear();
    change('<svg><rect fill="red"/></svg>');
    vi.advanceTimersByTime(200);
    expect(post).toHaveBeenCalledExactlyOnceWith(
      {
        ...envelope,
        type: "change",
        document: { svg: '<svg><rect fill="red"/></svg>', filename: "new.svg" },
      },
      context.origin,
    );
    bridge.notify();
    vi.advanceTimersByTime(200);
    expect(post).toHaveBeenCalledTimes(1);
    bridge.dispose();
    change("<svg/>");
    vi.advanceTimersByTime(200);
    expect(post).toHaveBeenCalledTimes(1);
  });
});
