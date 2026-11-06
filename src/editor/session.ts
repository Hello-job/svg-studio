import SvgCanvas from "@svgedit/svgcanvas";
import { blankSvg, prepareSvg, SAMPLE_SVG } from "./documents";
import { readLayers, readSelection } from "./selection";
import type { CanvasEngine, Command, EditorSnapshot, Tool } from "./types";

export class EditorSession {
  readonly canvas: CanvasEngine;
  private listeners = new Set<() => void>();
  private snapshot: EditorSnapshot;
  private changing = false;

  constructor(host: HTMLElement, textInput: HTMLInputElement, source?: string) {
    this.canvas = new SvgCanvas(host, {
      dimensions: [800, 600],
      initFill: { color: "f4a261", opacity: 1 },
      initStroke: { color: "none", opacity: 1, width: 2 },
      initOpacity: 1,
      text: {
        font_family: "Arial, sans-serif",
        font_size: 28,
        stroke_width: 0,
      },
      baseUnit: "px",
      snappingStep: 10,
      gridSnapping: false,
      imgPath: "",
      show_outside_canvas: false,
      selectNew: true,
    }) as unknown as CanvasEngine;
    this.canvas.textActions.setInputElem(textInput);
    this.snapshot = {
      tool: "select",
      selected: null,
      selectedIds: [],
      layers: [],
      width: 800,
      height: 600,
      zoom: 1,
      canUndo: false,
      canRedo: false,
      fill: "#f4a261",
      stroke: "none",
      dirty: false,
      revision: 0,
    };
    this.load(source ?? SAMPLE_SVG, true);
    for (const event of ["selected", "transition", "pointsAdded"]) {
      this.canvas.bind(event, () => this.refresh(false));
    }
    for (const event of ["changed", "sourcechanged"]) {
      this.canvas.bind(event, () => this.refresh(true));
    }
    const initial = this.canvas.getSvgContent().querySelector("#rounded-rect");
    if (initial) this.canvas.selectOnly([initial], true);
    this.refresh(false);
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getSnapshot = () => this.snapshot;

  private refresh(changed: boolean) {
    if (this.changing) return;
    const nativeMode = this.canvas.getMode();
    const viewTool = ["pan", "zoom", "eyedropper"].includes(this.snapshot.tool);
    const waitingForPath =
      this.snapshot.tool === "pathedit" && nativeMode === "select";
    if (!viewTool && !waitingForPath) {
      const modes: Record<string, Tool> = {
        select: "select",
        textedit: "text",
        pathedit: "pathedit",
        fhpath: "fhpath",
        path: "path",
        line: "line",
        rect: "rect",
        ellipse: "ellipse",
        text: "text",
      };
      if (modes[nativeMode])
        this.snapshot = { ...this.snapshot, tool: modes[nativeMode] };
    }
    const elements = this.canvas
      .getSelectedElements()
      .filter((el) => el !== null);
    const unlocked = elements.filter(
      (el) => !el.closest('[data-locked="true"]'),
    );
    if (unlocked.length !== elements.length) {
      this.changing = true;
      this.canvas.selectOnly(unlocked, true);
      this.changing = false;
    }
    const selectedIds = this.canvas
      .getSelectedElements()
      .filter((el) => el !== null)
      .map((el) => el.id);
    const selected = readSelection(this.canvas);
    this.snapshot = {
      ...this.snapshot,
      selected,
      selectedIds,
      layers: readLayers(this.canvas.getSvgContent()),
      canUndo: this.canvas.undoMgr.getUndoStackSize() > 0,
      canRedo: this.canvas.undoMgr.getRedoStackSize() > 0,
      dirty: changed || this.snapshot.dirty,
      revision: this.snapshot.revision + Number(changed),
    };
    if (changed) {
      const resolution = this.canvas.getResolution();
      this.snapshot.width = resolution.w;
      this.snapshot.height = resolution.h;
      this.layout();
    }
    for (const listener of this.listeners) listener();
  }

  private layout() {
    const { width, height, zoom } = this.snapshot;
    const root = this.canvas.getSvgRoot(),
      content = this.canvas.getSvgContent();
    root.setAttribute("width", String(width * zoom));
    root.setAttribute("height", String(height * zoom));
    content.setAttribute("x", "0");
    content.setAttribute("y", "0");
    content.setAttribute("width", String(width * zoom));
    content.setAttribute("height", String(height * zoom));
    for (const element of this.canvas.getSelectedElements()) {
      if (element)
        this.canvas.selectorManager.requestSelector(element).resize();
    }
  }

  load(source: string, initial = false) {
    const clean = prepareSvg(source);
    if (this.snapshot.zoom !== 1) this.zoomTo(1);
    this.changing = true;
    const result = this.canvas.setSvgString(clean, initial);
    this.changing = false;
    if (!result) throw new Error("SVG-Edit 无法打开此文件，请检查 SVG 格式。");
    const { w, h } = this.canvas.getResolution();
    this.snapshot = {
      ...this.snapshot,
      width: w,
      height: h,
      zoom: 1,
      tool: "select",
      dirty: !initial,
    };
    this.canvas.setMode("select");
    if (initial) this.canvas.undoMgr.resetUndoStack();
    this.layout();
    this.refresh(!initial);
  }

  newDocument(width: number, height: number) {
    this.load(blankSvg(width, height));
  }

  serialize() {
    // 不调用会清除路径编辑状态的 getSvgString，草稿快照保持当前交互。
    const content = this.canvas
      .getSvgContent()
      .cloneNode(true) as SVGSVGElement;
    content.setAttribute("width", String(this.snapshot.width));
    content.setAttribute("height", String(this.snapshot.height));
    content.removeAttribute("x");
    content.removeAttribute("y");
    content.removeAttribute("id");
    return new XMLSerializer().serializeToString(content);
  }

  markSaved() {
    this.snapshot = { ...this.snapshot, dirty: false };
    this.refresh(false);
  }

  setTool(tool: Tool) {
    const selectedPath = this.canvas.getSelectedElements()[0];
    this.canvas.setMode(
      ["pan", "zoom", "eyedropper", "pathedit"].includes(tool)
        ? "select"
        : tool,
    );
    if (tool === "pathedit" && selectedPath?.localName === "path")
      this.canvas.pathActions.toEditMode(selectedPath);
    const style = this.canvas.getStyle();
    const defaults: Record<string, string | number> = {
      fill: this.snapshot.fill,
      stroke: this.snapshot.stroke,
      stroke_width: 2,
      stroke_dasharray: "none",
      stroke_linejoin: "miter",
      stroke_linecap: "butt",
      stroke_opacity: 1,
      fill_opacity: 1,
      opacity: 1,
    };
    for (const [key, fallback] of Object.entries(defaults)) {
      if (style[key] == null || style[key] === "null") {
        this.canvas.setCurShape(key, fallback);
        this.canvas.setCurProperties(key, fallback);
      }
    }
    if (
      ["line", "fhpath", "path"].includes(tool) &&
      this.canvas.getStyle().stroke === "none"
    ) {
      this.canvas.setCurShape("stroke", "#132c50");
    }
    if (["line", "fhpath"].includes(tool))
      this.canvas.setCurShape("fill", "none");
    this.snapshot = { ...this.snapshot, tool };
    this.refresh(false);
  }

  editPath(id: string) {
    const element = this.canvas
      .getSvgContent()
      .querySelector(`[id="${CSS.escape(id)}"]`);
    if (
      !element ||
      element.localName !== "path" ||
      element.closest('[data-locked="true"]')
    )
      return;
    this.canvas.setMode("select");
    this.canvas.pathActions.toEditMode(element);
    this.snapshot = { ...this.snapshot, tool: "pathedit" };
    this.refresh(false);
  }

  zoomTo(zoom: number) {
    const next = Math.max(0.1, Math.min(8, zoom));
    this.snapshot = { ...this.snapshot, zoom: next };
    this.canvas.setZoom(next);
    this.layout();
    this.canvas.pathActions.zoomChange();
    this.refresh(false);
  }

  fit(availableWidth: number, availableHeight: number) {
    this.zoomTo(
      Math.min(
        (availableWidth - 120) / this.snapshot.width,
        (availableHeight - 120) / this.snapshot.height,
        1,
      ),
    );
  }

  select(id: string, add = false) {
    const element = this.canvas
      .getSvgContent()
      .querySelector(`[id="${CSS.escape(id)}"]`);
    if (
      !element ||
      element.getAttribute("data-locked") === "true" ||
      element.getAttribute("display") === "none"
    )
      return;
    const selected = this.canvas
      .getSelectedElements()
      .filter((el) => el !== null);
    this.setTool("select");
    this.canvas.selectOnly(add ? [...selected, element] : [element], true);
  }

  setColor(kind: "fill" | "stroke", value: string) {
    this.snapshot = { ...this.snapshot, [kind]: value };
    this.canvas.setColor(kind, value);
    this.refresh(false);
  }

  attribute(name: string, value: string | number) {
    this.canvas.changeSelectedAttribute(name, value);
    this.refresh(false);
  }
  property(name: string, value: number, preserveAspect = false) {
    if (!this.snapshot.selected) return;
    if (name === "opacity") this.canvas.setOpacity(value / 100);
    else if (name === "radius") this.canvas.setRectRadius(value);
    else if (name === "rotation") this.canvas.setRotationAngle(value);
    else if (name === "blur") this.canvas.setBlur(value);
    else if (name === "strokeWidth") this.canvas.setStrokeWidth(value);
    else if (name === "fontSize") this.canvas.setFontSize(value);
    else this.geometry(name, value, preserveAspect);
    this.refresh(false);
  }

  private geometry(name: string, value: number, preserveAspect: boolean) {
    const selected = this.snapshot.selected;
    const element = this.canvas.getSelectedElements()[0];
    if (!selected || !element) return;
    const { x, y, width, height } = selected;
    const matrix =
      element.transform.baseVal.consolidate()?.matrix ?? new DOMMatrix();
    let change = new DOMMatrix();
    if (name === "x") change = change.translate(value - x, 0);
    if (name === "y") change = change.translate(0, value - y);
    if (name === "width" && width > 0 && value > 0)
      change = change
        .translate(x, y)
        .scale(value / width, preserveAspect ? value / width : 1)
        .translate(-x, -y);
    if (name === "height" && height > 0 && value > 0)
      change = change
        .translate(x, y)
        .scale(preserveAspect ? value / height : 1, value / height)
        .translate(-x, -y);
    const next = change.multiply(
      new DOMMatrix([
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        matrix.e,
        matrix.f,
      ]),
    );
    this.attribute("transform", next.toString());
  }

  resize(width: number, height: number) {
    this.changing = true;
    this.canvas.setResolution(width, height);
    this.snapshot = { ...this.snapshot, width, height };
    this.layout();
    this.changing = false;
    this.refresh(true);
  }

  align(type: string, relativeTo: string) {
    this.canvas.alignSelectedElements(type, relativeTo);
    this.refresh(false);
  }

  command(command: Command) {
    const canvas = this.canvas;
    const commands: Record<Command, () => void> = {
      undo: () => {
        const zoom = this.snapshot.zoom;
        this.zoomTo(1);
        canvas.undoMgr.undo();
        this.zoomTo(zoom);
      },
      redo: () => {
        const zoom = this.snapshot.zoom;
        this.zoomTo(1);
        canvas.undoMgr.redo();
        this.zoomTo(zoom);
      },
      delete: () => canvas.deleteSelectedElements(),
      duplicate: () => canvas.cloneSelectedElements(16, 16),
      copy: () => canvas.copySelectedElements(),
      cut: () => canvas.cutSelectedElements(),
      paste: () => canvas.pasteElements(),
      "select-all": () => {
        const unlocked = [
          ...canvas.getCurrentDrawing().getCurrentLayer().children,
        ].filter(
          (el) =>
            el.localName !== "title" &&
            el.getAttribute("data-locked") !== "true" &&
            el.getAttribute("display") !== "none",
        );
        canvas.selectOnly(unlocked, true);
      },
      group: () => canvas.groupSelectedElements(),
      ungroup: () => canvas.ungroupSelectedElement(),
      front: () => canvas.moveToTopSelectedElement(),
      back: () => canvas.moveToBottomSelectedElement(),
      raise: () => canvas.moveUpDownSelected("Up"),
      lower: () => canvas.moveUpDownSelected("Down"),
      "flip-x": () => canvas.flipSelectedElements(-1, 1),
      "flip-y": () => canvas.flipSelectedElements(1, -1),
      "to-path": () => canvas.convertToPath(),
    };
    commands[command]();
    this.refresh(false);
  }

  toggleLayer(id: string, kind: "visibility" | "lock") {
    const element = this.canvas
      .getSvgContent()
      .querySelector(`[id="${CSS.escape(id)}"]`);
    if (!element) return;
    const name = kind === "visibility" ? "display" : "data-locked";
    let value: string;
    if (kind === "visibility")
      value = element.getAttribute("display") === "none" ? "inline" : "none";
    else
      value = element.getAttribute("data-locked") === "true" ? "false" : "true";
    this.canvas.changeSelectedAttribute(name, value, [element]);
    this.canvas.clearSelection();
    this.refresh(false);
  }

  rename(id: string, name: string) {
    const element = this.canvas
      .getSvgContent()
      .querySelector(`[id="${CSS.escape(id)}"]`);
    if (element && name.trim())
      this.canvas.changeSelectedAttribute("data-name", name.trim(), [element]);
    this.refresh(false);
  }

  setText(value: string) {
    this.canvas.setTextContent(value);
  }
  setFont(value: string) {
    this.canvas.setFontFamily(value);
  }

  addShape(kind: "star" | "polygon") {
    const { width, height } = this.snapshot;
    const points = Array.from(
      { length: kind === "star" ? 10 : 6 },
      (_, index) => {
        const count = kind === "star" ? 10 : 6;
        const radius = kind === "star" && index % 2 === 1 ? 48 : 100;
        const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
        return `${width / 2 + Math.cos(angle) * radius},${height / 2 + Math.sin(angle) * radius}`;
      },
    ).join(" ");
    const source = new DOMParser().parseFromString(
      this.serialize(),
      "image/svg+xml",
    );
    const polygon = source.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    const id = `shape-${crypto.randomUUID()}`;
    polygon.setAttribute("id", id);
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", this.snapshot.fill);
    polygon.setAttribute("data-name", kind === "star" ? "星形" : "六边形");
    source.documentElement.querySelector("g")!.append(polygon);
    this.load(new XMLSerializer().serializeToString(source));
    this.select(id);
  }
}
