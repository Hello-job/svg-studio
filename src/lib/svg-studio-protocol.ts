export const STUDIO_PROTOCOL = "svg-studio:v1";

export interface SvgStudioDocument {
  svg: string;
  filename: string;
}

interface Envelope {
  protocol: typeof STUDIO_PROTOCOL;
  instance: string;
}

export type HostMessage = Envelope &
  (
    | { type: "connect" }
    | {
        type: "load";
        svg?: string;
        filename: string;
        interceptSave: boolean;
      }
    | { type: "value"; svg: string; filename: string }
  );

export type StudioMessage = Envelope &
  (
    | { type: "ready" }
    | { type: "loaded" | "change" | "save"; document: SvgStudioDocument }
    | { type: "error"; message: string }
  );

function envelope(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "protocol" in value &&
    value.protocol === STUDIO_PROTOCOL &&
    "instance" in value &&
    typeof value.instance === "string" &&
    value.instance.length > 0 &&
    value.instance.length <= 100
  );
}

function validSvg(value: unknown): value is string {
  return typeof value === "string" && value.length <= 5_000_000;
}

function validFilename(value: unknown): value is string {
  return typeof value === "string" && value.length <= 255;
}

export function isHostMessage(value: unknown): value is HostMessage {
  if (!envelope(value)) return false;
  if (value.type === "connect") return true;
  if (!validFilename(value.filename)) return false;
  if (value.type === "value") return validSvg(value.svg);
  return (
    value.type === "load" &&
    (value.svg === undefined || validSvg(value.svg)) &&
    typeof value.interceptSave === "boolean"
  );
}

export function isStudioMessage(value: unknown): value is StudioMessage {
  if (!envelope(value)) return false;
  if (value.type === "ready") return true;
  if (value.type === "error") return typeof value.message === "string";
  if (!["loaded", "change", "save"].includes(String(value.type))) return false;
  const document = value.document;
  return (
    typeof document === "object" &&
    document !== null &&
    "svg" in document &&
    validSvg(document.svg) &&
    "filename" in document &&
    validFilename(document.filename)
  );
}
