import DOMPurify from "dompurify";
import sampleSvg from "./sample.svg?raw";

export const SAMPLE_SVG = sampleSvg;

export function blankSvg(width = 800, height = 600) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g class="layer"><title>图层 1</title></g></svg>`;
}

// 文件内容只在导入边界清理，内部直接使用浏览器 SVG DOM。
export function prepareSvg(source: string): string {
  const original = new DOMParser().parseFromString(source, "image/svg+xml");
  if (
    original.querySelector("parsererror") ||
    original.documentElement.localName !== "svg"
  ) {
    throw new Error("文件不是有效的 SVG，请检查文件内容后重试。");
  }
  const clean = DOMPurify.sanitize(original.documentElement, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: [
      "script",
      "foreignObject",
      "style",
      "a",
      "animate",
      "animateTransform",
      "set",
    ],
    ADD_ATTR: ["data-name", "data-locked"],
  });
  const doc = new DOMParser().parseFromString(clean, "image/svg+xml");
  const svg = doc.documentElement;
  if (svg.localName !== "svg") throw new Error("无法读取 SVG 内容。");
  for (const element of [svg, ...svg.querySelectorAll("*")]) {
    const style = (element as SVGElement).style;
    if (style?.length) {
      const presentation = new Set([
        "fill",
        "fill-opacity",
        "fill-rule",
        "stroke",
        "stroke-width",
        "stroke-opacity",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "opacity",
        "font-family",
        "font-size",
        "font-weight",
        "font-style",
        "letter-spacing",
        "word-spacing",
        "text-anchor",
        "dominant-baseline",
        "color",
        "display",
        "visibility",
        "filter",
        "clip-path",
        "mask",
      ]);
      for (let index = style.length - 1; index >= 0; index--) {
        const property = style.item(index);
        if (presentation.has(property))
          element.setAttribute(
            property,
            style.getPropertyValue(property).trim(),
          );
        else if (property === "transform" || property === "transform-origin")
          continue;
        style.removeProperty(property);
      }
      if (!style.length) element.removeAttribute("style");
    }
    for (const attribute of [...element.attributes]) {
      const value = attribute.value.trim();
      const isHref = attribute.localName === "href";
      const isLocalImage = /^data:image\/(png|jpeg|gif|webp);base64,/i.test(
        value,
      );
      const externalUrl = [
        ...value.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi),
      ].some((match) => !match[2].trim().startsWith("#"));
      if (
        (isHref && !value.startsWith("#") && !isLocalImage) ||
        externalUrl ||
        /@import|expression\s*\(/i.test(value)
      ) {
        element.removeAttributeNode(attribute);
      }
    }
  }
  const viewBox = svg
    .getAttribute("viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const width =
    Number.parseFloat(svg.getAttribute("width") ?? "") || viewBox?.[2] || 800;
  const height =
    Number.parseFloat(svg.getAttribute("height") ?? "") || viewBox?.[3] || 600;
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    width > 20000 ||
    height > 20000
  ) {
    throw new Error("画布宽高需要在 1 至 20000 之间。");
  }
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!viewBox) svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  return new XMLSerializer().serializeToString(svg);
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadPng(
  svg: string,
  name: string,
  width: number,
  height: number,
) {
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve),
    );
    if (!blob) throw new Error("无法生成 PNG，请尝试保存为 SVG。");
    downloadBlob(blob, name.replace(/\.svg$/i, "") + ".png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
