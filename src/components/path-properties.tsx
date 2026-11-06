import type { EditorSession } from "../editor/session";

export function PathProperties({
  session,
  run,
}: {
  session: EditorSession;
  run(action: () => void): void;
}) {
  const active = session.canvas.getMode() === "pathedit";
  return (
    <section className="property-section">
      <div className="section-heading">
        <h2>路径节点</h2>
      </div>
      <p className="path-hint">
        {active
          ? "点击节点进行选择，拖动节点或控制柄调整曲线。"
          : "点击画布中的路径开始编辑节点。"}
      </p>
      <div className="node-actions">
        <button
          disabled={!active}
          onClick={() => run(() => session.canvas.pathActions.clonePathNode())}
        >
          添加节点
        </button>
        <button
          disabled={!active}
          onClick={() => run(() => session.canvas.pathActions.deletePathNode())}
        >
          删除节点
        </button>
        <button
          disabled={!active}
          onClick={() => run(() => session.canvas.pathActions.setSegType(4))}
        >
          直线节点
        </button>
        <button
          disabled={!active}
          onClick={() => run(() => session.canvas.pathActions.setSegType(6))}
        >
          曲线节点
        </button>
        <button
          disabled={!active}
          onClick={() =>
            run(() => session.canvas.pathActions.opencloseSubPath())
          }
        >
          闭合 / 打开路径
        </button>
      </div>
    </section>
  );
}
