import type { CanvasEngine, Layer, Selection } from "./types";

const NAMES: Record<string, string> = {
  rect: "矩形",
  circle: "圆形",
  ellipse: "椭圆",
  path: "路径",
  line: "直线",
  polyline: "折线",
  polygon: "多边形",
  text: "文字",
  g: "组合",
  image: "图片",
  use: "引用",
};
export function elementName(element: Element) {
  return (
    element.getAttribute("data-name") || NAMES[element.localName] || "图形"
  );
}
export function elementMatrix(element: SVGGraphicsElement): DOMMatrix {
  const transforms = element.transform.baseVal;
  let result = new DOMMatrix();
  for (let index = 0; index < transforms.numberOfItems; index++) {
    const { a, b, c, d, e, f } = transforms.getItem(index).matrix;
    result = result.multiply(new DOMMatrix([a, b, c, d, e, f]));
  }
  return result;
}
export function readSelection(canvas: CanvasEngine): Selection | null {
  const element = canvas.getSelectedElements().find((item) => item !== null);
  if (!element) return null;
  const box = element.getBBox();
  const matrix = elementMatrix(element);
  let bounds = { x: box.x, y: box.y, width: box.width, height: box.height };
  if (matrix) {
    const corners = [
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x, box.y + box.height],
      [box.x + box.width, box.y + box.height],
    ];
    const points = corners.map(([x, y]) =>
      new DOMPoint(x, y).matrixTransform(matrix),
    );
    const xs = points.map((p) => p.x),
      ys = points.map((p) => p.y);
    bounds = {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  }
  const style = getComputedStyle(element);
  const attr = (name: string, fallback: string) =>
    element.getAttribute(name) ?? fallback;
  return {
    ...bounds,
    id: element.id,
    tag: element.localName,
    label: elementName(element),
    fill: attr("fill", style.fill || "#000000"),
    stroke: attr("stroke", style.stroke || "none"),
    strokeWidth: Number.parseFloat(attr("stroke-width", "1")),
    dash: attr("stroke-dasharray", "none"),
    linecap: attr("stroke-linecap", "butt"),
    linejoin: attr("stroke-linejoin", "miter"),
    opacity: Number(attr("opacity", "1")) * 100,
    radius: Number(attr("rx", "0")),
    rotation: (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI,
    blur: Number(canvas.getBlur(element)) || 0,
    text: element.textContent ?? "",
    fontFamily: attr("font-family", "Arial, sans-serif"),
    fontSize: Number.parseFloat(attr("font-size", "24")),
    bold: attr("font-weight", "normal") === "bold",
    italic: attr("font-style", "normal") === "italic",
  };
}

export function readLayers(content: SVGSVGElement): Layer[] {
  const result: Layer[] = [];
  function visit(parent: Element, depth: number) {
    for (const el of [...parent.children].reverse()) {
      if (["defs", "title", "desc", "metadata"].includes(el.localName))
        continue;
      const isLayer = el.localName === "g" && el.classList.contains("layer");
      if (isLayer) {
        visit(el, depth);
        continue;
      }
      result.push({
        id: el.id,
        name: elementName(el),
        tag: el.localName,
        hidden: el.getAttribute("display") === "none",
        locked: el.getAttribute("data-locked") === "true",
        depth,
      });
      if (el.localName === "g") visit(el, depth + 1);
    }
  }
  visit(content, 0);
  return result;
}
