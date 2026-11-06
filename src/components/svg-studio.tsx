"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { isStudioMessage, STUDIO_PROTOCOL } from "@/lib/svg-studio-protocol";
import type { HostMessage, SvgStudioDocument } from "@/lib/svg-studio-protocol";

export type { SvgStudioDocument } from "@/lib/svg-studio-protocol";

export interface SvgStudioProps {
  /** 独立编辑器的完整 URL，可使用自己的部署地址。 */
  editorUrl: string;
  value?: string;
  defaultValue?: string;
  filename?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  onChange?(svg: string, document: SvgStudioDocument): void;
  /** 提供回调后，编辑器的保存按钮交给宿主处理，不再自动下载。 */
  onSave?(document: SvgStudioDocument): void;
  onReady?(document: SvgStudioDocument): void;
  onError?(error: Error): void;
}

interface FrameAddress {
  src: string;
  origin: string;
  instance: string;
}

const subscribeToClient = () => () => {};
const clientOrigin = () => window.location.origin;
const serverOrigin = () => null;

export function SvgStudio(props: SvgStudioProps) {
  const origin = useSyncExternalStore(
    subscribeToClient,
    clientOrigin,
    serverOrigin,
  );
  if (!origin)
    return (
      <div className={props.className} style={props.style} role="status">
        Loading SVG Studio…
      </div>
    );
  return (
    <SvgStudioFrame key={props.editorUrl} {...props} parentOrigin={origin} />
  );
}

function SvgStudioFrame({
  editorUrl,
  value,
  defaultValue,
  filename = "untitled.svg",
  className,
  style,
  title = "SVG Studio editor",
  onChange,
  onSave,
  onReady,
  onError,
  parentOrigin,
}: SvgStudioProps & { parentOrigin: string }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [frame] = useState<FrameAddress | Error>(() => {
    try {
      const url = new URL(editorUrl, window.location.href);
      if (!["https:", "http:"].includes(url.protocol))
        throw new Error("editorUrl must be an HTTP(S) URL.");
      const instance = crypto.randomUUID();
      url.searchParams.set("embed", "1");
      url.searchParams.set("parentOrigin", parentOrigin);
      url.searchParams.set("instance", instance);
      return { src: url.href, origin: url.origin, instance };
    } catch (cause) {
      return cause instanceof Error ? cause : new Error("Invalid editorUrl.");
    }
  });
  const address = frame instanceof Error ? null : frame;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(
    frame instanceof Error ? frame.message : null,
  );
  const current = useRef({
    value,
    defaultValue,
    filename,
    onChange,
    onSave,
    onReady,
    onError,
  });
  const lastReceived = useRef<string | undefined>(undefined);
  const lastApplied = useRef<string | undefined>(undefined);
  const connected = useRef(false);

  useEffect(() => {
    current.current = {
      value,
      defaultValue,
      filename,
      onChange,
      onSave,
      onReady,
      onError,
    };
  });

  useEffect(() => {
    if (frame instanceof Error) current.current.onError?.(frame);
  }, [frame]);

  useEffect(() => {
    if (!address) return;
    const receive = (event: MessageEvent<unknown>) => {
      if (
        event.source !== iframe.current?.contentWindow ||
        event.origin !== address.origin ||
        !isStudioMessage(event.data) ||
        event.data.instance !== address.instance
      )
        return;
      const message = event.data;
      if (message.type === "ready") {
        if (connected.current) return;
        const props = current.current;
        const init: HostMessage = {
          protocol: STUDIO_PROTOCOL,
          instance: address.instance,
          type: "load",
          svg: props.value ?? props.defaultValue,
          filename: props.filename,
          interceptSave: Boolean(props.onSave),
        };
        lastApplied.current = init.svg;
        iframe.current?.contentWindow?.postMessage(init, address.origin);
      } else if (message.type === "error") {
        setError(message.message);
        current.current.onError?.(new Error(message.message));
      } else {
        const document = message.document;
        lastReceived.current = document.svg;
        if (message.type === "loaded") {
          const firstLoad = !connected.current;
          connected.current = true;
          setError(null);
          setReady(true);
          if (firstLoad) current.current.onReady?.(document);
        } else if (message.type === "change") {
          current.current.onChange?.(document.svg, document);
        } else if (message.type === "save") {
          current.current.onSave?.(document);
        }
      }
    };
    window.addEventListener("message", receive);
    const timeout = window.setTimeout(() => {
      if (connected.current) return;
      const failure = new Error(
        "The editor did not connect. Check editorUrl and deployment access.",
      );
      setError(failure.message);
      current.current.onError?.(failure);
    }, 30_000);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", receive);
    };
  }, [address]);

  useEffect(() => {
    if (!address || value === undefined) return;
    if (value === lastReceived.current) {
      lastApplied.current = value;
      return;
    }
    if (value === lastApplied.current) return;
    const envelope = {
      protocol: STUDIO_PROTOCOL,
      instance: address.instance,
      svg: value,
      filename,
    } as const;
    const update: HostMessage = connected.current
      ? { ...envelope, type: "value" }
      : {
          ...envelope,
          type: "load",
          interceptSave: Boolean(current.current.onSave),
        };
    lastApplied.current = value;
    iframe.current?.contentWindow?.postMessage(update, address.origin);
  }, [value, filename, ready, address]);

  return (
    <div
      className={[
        "relative h-[720px] min-h-[440px] w-full overflow-hidden rounded-lg border bg-background",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-busy={!ready && !error}
    >
      {address && (
        <iframe
          ref={iframe}
          src={address.src}
          title={title}
          className="block h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-downloads allow-modals"
          referrerPolicy="no-referrer"
          onLoad={() => {
            const message: HostMessage = {
              protocol: STUDIO_PROTOCOL,
              instance: address.instance,
              type: "connect",
            };
            iframe.current?.contentWindow?.postMessage(message, address.origin);
          }}
        />
      )}
      {(!ready || error) && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background p-6 text-center text-sm text-muted-foreground"
          role={error ? "alert" : "status"}
        >
          {error ?? "Loading SVG Studio…"}
        </div>
      )}
    </div>
  );
}
