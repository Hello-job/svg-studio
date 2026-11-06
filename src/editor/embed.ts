import { isHostMessage, STUDIO_PROTOCOL } from "../lib/svg-studio-protocol";
import type {
  StudioMessage,
  SvgStudioDocument,
} from "../lib/svg-studio-protocol";
import { blankSvg } from "./documents";
import type { EditorSession } from "./session";

export interface EmbedContext {
  origin: string;
  instance: string;
}

export function readEmbedContext(): EmbedContext | null {
  if (window.parent === window) return null;
  const query = new URLSearchParams(window.location.search);
  if (query.get("embed") !== "1") return null;
  try {
    const origin = new URL(query.get("parentOrigin") ?? "");
    const instance = query.get("instance");
    if (
      !instance ||
      instance.length > 100 ||
      !["http:", "https:"].includes(origin.protocol)
    )
      return null;
    return { origin: origin.origin, instance };
  } catch {
    return null;
  }
}

export function connectEmbed(
  context: EmbedContext,
  session: Pick<EditorSession, "subscribe" | "serialize" | "load">,
  options: {
    getFilename(): string;
    setFilename(value: string): void;
    fit(): void;
  },
) {
  let initialized = false;
  let loading = false;
  let interceptSave = false;
  let previous = "";
  let timer: ReturnType<typeof setTimeout> | undefined;
  const send = (message: StudioMessage) =>
    window.parent.postMessage(message, context.origin);
  const document = (): SvgStudioDocument => ({
    svg: session.serialize(),
    filename: options.getFilename(),
  });
  const notify = () => {
    if (!initialized || loading) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const value = document();
      const signature = JSON.stringify(value);
      if (signature === previous) return;
      previous = signature;
      send({
        protocol: STUDIO_PROTOCOL,
        instance: context.instance,
        type: "change",
        document: value,
      });
    }, 200);
  };
  const receive = (event: MessageEvent<unknown>) => {
    if (
      event.source !== window.parent ||
      event.origin !== context.origin ||
      !isHostMessage(event.data) ||
      event.data.instance !== context.instance
    )
      return;
    const message = event.data;
    const envelope = {
      protocol: STUDIO_PROTOCOL,
      instance: context.instance,
    } as const;
    if (message.type === "connect") {
      send({ ...envelope, type: "ready" });
      return;
    }
    if (message.type === "load" && initialized) return;
    if (message.type === "value" && !initialized) return;
    try {
      loading = true;
      if (message.svg !== undefined)
        session.load(message.svg.trim() ? message.svg : blankSvg(), true);
      options.setFilename(message.filename);
      options.fit();
      if (message.type === "load") interceptSave = message.interceptSave;
      initialized = true;
      const value = { svg: session.serialize(), filename: message.filename };
      previous = JSON.stringify(value);
      send({ ...envelope, type: "loaded", document: value });
    } catch (error) {
      send({
        ...envelope,
        type: "error",
        message: error instanceof Error ? error.message : "无法打开 SVG。",
      });
    } finally {
      loading = false;
    }
  };
  window.addEventListener("message", receive);
  const unsubscribe = session.subscribe(notify);
  send({
    protocol: STUDIO_PROTOCOL,
    instance: context.instance,
    type: "ready",
  });
  return {
    notify,
    save(value: SvgStudioDocument) {
      if (!initialized) return false;
      send({
        protocol: STUDIO_PROTOCOL,
        instance: context.instance,
        type: "save",
        document: value,
      });
      return interceptSave;
    },
    dispose() {
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener("message", receive);
    },
  };
}
