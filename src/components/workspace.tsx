import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { LoaderCircle } from "lucide-react";
import type { EditorSession } from "../editor/session";
import type { EditorSnapshot } from "../editor/types";

export function Workspace({
  hostRef,
  viewportRef,
  session,
  state,
  rulers,
  checker,
  run,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  session: EditorSession | null;
  state: EditorSnapshot;
  rulers: boolean;
  checker: boolean;
  run(action: () => void): void;
}) {
  const [origin, setOrigin] = useState({ x: 64, y: 64 });
  const [space, setSpace] = useState(false);
  const pan = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const measure = () => {
    const stage = viewportRef.current,
      host = hostRef.current;
    if (!stage || !host) return;
    const a = stage.getBoundingClientRect(),
      b = host.getBoundingClientRect();
    setOrigin({ x: b.left - a.left, y: b.top - a.top });
  };
  useEffect(() => {
    const stage = viewportRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    if (hostRef.current) observer.observe(hostRef.current);
    return () => observer.disconnect();
    // 尺寸和缩放改变会由 ResizeObserver 统一更新标尺原点。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const stage = viewportRef.current;
    if (!stage || !session) return;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      session.zoomTo(
        session.getSnapshot().zoom * (event.deltaY > 0 ? 0.95 : 1.05),
      );
    };
    // React 的 wheel 监听默认为 passive，这里需要阻止浏览器整页缩放。
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => stage.removeEventListener("wheel", wheel);
  }, [session, viewportRef]);
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input,textarea,select,[contenteditable=true]")
      )
        return;
      if (event.code === "Space") {
        event.preventDefault();
        setSpace(true);
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpace(false);
    };
    const blur = () => {
      setSpace(false);
      pan.current = null;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
  const labelStep = Math.max(1, Math.ceil(50 / (state.zoom * 100))) * 100;
  const minorStep = Math.max(1, Math.ceil(6 / (state.zoom * 10))) * 10;
  const ticksX = Array.from(
    { length: Math.floor(state.width / labelStep) + 1 },
    (_, i) => i * labelStep,
  );
  const ticksY = Array.from(
    { length: Math.floor(state.height / labelStep) + 1 },
    (_, i) => i * labelStep,
  );
  return (
    <main
      className={`workspace${rulers ? " with-rulers" : ""}`}
      aria-label="SVG 编辑工作区"
    >
      {rulers && (
        <>
          <div className="ruler-corner" />
          <div className="ruler ruler-horizontal">
            <div
              className="ruler-ticks"
              style={{
                left: origin.x,
                width: state.width * state.zoom,
                backgroundSize: `${minorStep * state.zoom}px 5px`,
              }}
            >
              {ticksX.map((tick) => (
                <span key={tick} style={{ left: tick * state.zoom }}>
                  {tick}
                </span>
              ))}
            </div>
          </div>
          <div className="ruler ruler-vertical">
            <div
              className="ruler-ticks"
              style={{
                top: origin.y,
                height: state.height * state.zoom,
                backgroundSize: `5px ${minorStep * state.zoom}px`,
              }}
            >
              {ticksY.map((tick) => (
                <span key={tick} style={{ top: tick * state.zoom }}>
                  {tick}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
      <div
        ref={viewportRef}
        className={`stage-viewport tool-${state.tool}${space ? " is-panning" : ""}`}
        onScroll={measure}
        onPointerDownCapture={(event) => {
          if (!session) return;
          const stage = viewportRef.current!;
          if (space || state.tool === "pan" || event.button === 1) {
            event.preventDefault();
            event.stopPropagation();
            pan.current = {
              x: event.clientX,
              y: event.clientY,
              left: stage.scrollLeft,
              top: stage.scrollTop,
            };
            stage.setPointerCapture(event.pointerId);
            return;
          }
          if (state.tool === "zoom") {
            event.preventDefault();
            event.stopPropagation();
            session.zoomTo(state.zoom * (event.altKey ? 0.8 : 1.25));
            return;
          }
          if (
            state.tool === "pathedit" &&
            event.target instanceof SVGPathElement &&
            hostRef.current?.contains(event.target) &&
            event.target.closest("#svgcontent")
          ) {
            event.preventDefault();
            event.stopPropagation();
            run(() => session.editPath((event.target as SVGPathElement).id));
            return;
          }
          if (state.tool === "eyedropper") {
            event.preventDefault();
            event.stopPropagation();
            const target = event.target;
            if (
              target instanceof SVGElement &&
              hostRef.current?.contains(target)
            ) {
              const fill = getComputedStyle(target).fill;
              if (fill && fill !== "none")
                run(() => session.setColor("fill", fill));
            }
            session.setTool("select");
          }
        }}
        onPointerMove={(event) => {
          if (pan.current) {
            const stage = viewportRef.current!;
            stage.scrollLeft = pan.current.left - event.clientX + pan.current.x;
            stage.scrollTop = pan.current.top - event.clientY + pan.current.y;
          }
        }}
        onPointerUp={() => {
          pan.current = null;
        }}
        onPointerCancel={() => {
          pan.current = null;
        }}
        onDragOver={(event) => event.preventDefault()}
      >
        <div className="stage-pad">
          <div
            data-testid="artboard"
            ref={hostRef}
            className={`artboard${checker ? " checkerboard" : ""}`}
            style={{
              width: state.width * state.zoom,
              height: state.height * state.zoom,
            }}
          />
        </div>
        {!session && (
          <div className="editor-loading">
            <LoaderCircle size={20} className="spinning" />
            <span>正在载入编辑器…</span>
          </div>
        )}
      </div>
    </main>
  );
}
