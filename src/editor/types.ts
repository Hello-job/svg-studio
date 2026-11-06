export type Tool =
  | "select"
  | "pathedit"
  | "fhpath"
  | "line"
  | "path"
  | "rect"
  | "ellipse"
  | "text"
  | "pan"
  | "zoom"
  | "eyedropper";
export type Command =
  | "undo"
  | "redo"
  | "delete"
  | "duplicate"
  | "copy"
  | "cut"
  | "paste"
  | "select-all"
  | "group"
  | "ungroup"
  | "front"
  | "back"
  | "raise"
  | "lower"
  | "flip-x"
  | "flip-y"
  | "to-path";
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Selection extends Bounds {
  id: string;
  tag: string;
  label: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  dash: string;
  linecap: string;
  linejoin: string;
  opacity: number;
  radius: number;
  rotation: number;
  blur: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
}
export interface Layer {
  id: string;
  name: string;
  tag: string;
  hidden: boolean;
  locked: boolean;
  depth: number;
}
export interface EditorSnapshot {
  tool: Tool;
  selected: Selection | null;
  selectedIds: string[];
  layers: Layer[];
  width: number;
  height: number;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  fill: string;
  stroke: string;
  dirty: boolean;
  revision: number;
}

// 适配固定版本的真实方法；上游声明遗漏了部分方法，并包含未实现的 unbind。
export interface CanvasEngine {
  getSvgContent(): SVGSVGElement;
  getSvgRoot(): SVGSVGElement;
  getSvgString(): string;
  setSvgString(source: string, preventUndo?: boolean): boolean;
  getSelectedElements(): Array<SVGGraphicsElement | null>;
  getCurrentDrawing(): { getCurrentLayer(): SVGGElement };
  getResolution(): { w: number; h: number };
  setResolution(w: number, h: number): boolean;
  getZoom(): number;
  setZoom(value: number): void;
  setMode(mode: string): void;
  getMode(): string;
  getStyle(): Record<string, string | number | null>;
  setCurShape(name: string, value: string | number): void;
  setCurProperties(name: string, value: string | number): void;
  bind(
    event: string,
    callback: (window: Window, elements: unknown) => void,
  ): void;
  selectOnly(elements: Element[], showGrips?: boolean): void;
  clearSelection(): void;
  changeSelectedAttribute(
    name: string,
    value: string | number,
    elements?: Element[],
  ): void;
  setColor(kind: "fill" | "stroke", value: string): void;
  setStrokeWidth(value: number): void;
  setRectRadius(value: number): void;
  setOpacity(value: number): void;
  setBlur(value: number): void;
  getBlur(element: Element): number;
  getRotationAngle(element: Element): number;
  setRotationAngle(value: number): void;
  setFontFamily(value: string): void;
  setFontSize(value: number): void;
  setTextContent(value: string): void;
  setBold(value: boolean): void;
  setItalic(value: boolean): void;
  moveSelectedElements(dx: number, dy: number): void;
  deleteSelectedElements(): void;
  cloneSelectedElements(dx: number, dy: number): void;
  copySelectedElements(): void;
  cutSelectedElements(): void;
  pasteElements(): void;
  groupSelectedElements(): void;
  ungroupSelectedElement(): void;
  moveToTopSelectedElement(): void;
  moveToBottomSelectedElement(): void;
  moveUpDownSelected(direction: "Up" | "Down"): void;
  flipSelectedElements(x: number, y: number): void;
  alignSelectedElements(type: string, relativeTo: string): void;
  convertToPath(): void;
  selectAllInCurrentLayer(): void;
  undoMgr: {
    undo(): void;
    redo(): void;
    getUndoStackSize(): number;
    getRedoStackSize(): number;
    resetUndoStack(): void;
  };
  selectorManager: { requestSelector(element: Element): { resize(): void } };
  pathActions: {
    toEditMode(element: Element): void;
    zoomChange(): void;
    clonePathNode(): void;
    deletePathNode(): void;
    setSegType(type: number): void;
    opencloseSubPath(): void;
  };
  textActions: { setInputElem(element: HTMLInputElement): void };
}
