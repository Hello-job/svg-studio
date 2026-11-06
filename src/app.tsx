import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, CircleAlert, X } from "lucide-react";
import { Header } from "./components/header";
import type { FileActions } from "./components/header";
import { Toolbar } from "./components/toolbar";
import { Workspace } from "./components/workspace";
import { Inspector } from "./components/inspector";
import { StatusBar } from "./components/status-bar";
import { EditorDialogs } from "./components/editor-dialogs";
import { IconButton } from "./components/controls";
import { downloadBlob, downloadPng, prepareSvg } from "./editor/documents";
import { readDraft, saveDraft } from "./editor/draft";
import { shortcutFor } from "./editor/shortcuts";
import type { EditorSession } from "./editor/session";
import type { EditorSnapshot } from "./editor/types";

const INITIAL: EditorSnapshot = {
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
const subscribeEmpty = () => () => {};
const getEmpty = () => INITIAL;

export function App() {
  const hostRef = useRef<HTMLDivElement>(null),
    viewportRef = useRef<HTMLDivElement>(null),
    textRef = useRef<HTMLInputElement>(null),
    fileRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const [session, setSession] = useState<EditorSession | null>(null);
  const state = useSyncExternalStore(
    session?.subscribe ?? subscribeEmpty,
    session?.getSnapshot ?? getEmpty,
  );
  const [name, setName] = useState("图形设计.svg");
  const [rulers, setRulers] = useState(true),
    [checker, setChecker] = useState(false),
    [inspector, setInspector] = useState(true);
  const [notice, setNotice] = useState<{
    message: string;
    error?: boolean;
  } | null>(null);
  const [dialog, setDialog] = useState<"source" | "new" | "help" | null>(null);
  const [source, setSource] = useState("");

  const [confirmation, setConfirmation] = useState<{ action(): void } | null>(
    null,
  );
  const [exporting, setExporting] = useState(false);

  const run = (action: () => void) => {
    try {
      action();
    } catch (error) {
      setNotice({
        message:
          error instanceof Error ? error.message : "操作未完成，请重试。",
        error: true,
      });
    }
  };
  const fit = () => {
    const viewport = viewportRef.current;
    if (viewport && session)
      session.fit(viewport.clientWidth, viewport.clientHeight);
  };
  useEffect(() => {
    let active = true;
    void import("./editor/session")
      .then(({ EditorSession: Session }) => {
        if (
          !active ||
          initialized.current ||
          !hostRef.current ||
          !textRef.current
        )
          return;
        initialized.current = true;
        let draft = null;
        try {
          draft = readDraft();
          if (draft) prepareSvg(draft.svg);
        } catch {
          draft = null;
          setNotice({
            message: "本机草稿无法读取，已打开示例文件。",
            error: true,
          });
        }
        const controller = new Session(
          hostRef.current,
          textRef.current,
          draft?.svg,
        );
        if (draft) setName(draft.name);
        setSession(controller);
        const viewport = viewportRef.current;
        if (viewport)
          controller.fit(viewport.clientWidth, viewport.clientHeight);
      })
      .catch((error: unknown) => {
        setNotice({
          message:
            error instanceof Error
              ? error.message
              : "编辑器载入失败，请刷新页面。",
          error: true,
        });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.title = `${name}${state.dirty ? " *" : ""} · SVG Studio`;
    if (!session || !state.dirty) return;
    const timeout = window.setTimeout(() => {
      try {
        saveDraft({ name, svg: session.serialize() });
      } catch {
        setNotice({
          message: "本机草稿保存失败，请下载 SVG 保存作品。",
          error: true,
        });
      }
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [name, state.revision, state.dirty, session]);

  useEffect(() => {
    if (!state.dirty) return;
    const leave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [state.dirty]);

  useEffect(() => {
    if (!notice || notice.error) return;
    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const confirm = (action: () => void) => {
    if (state.dirty) setConfirmation({ action });
    else action();
  };
  const filename = () =>
    (name.trim() || "未命名").replace(/\.svg$/i, "") + ".svg";
  const actions: FileActions = {
    fit,
    open: () => fileRef.current?.click(),
    save: () =>
      run(() => {
        if (!session) return;
        const svg = session.serialize();
        downloadBlob(
          new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
          filename(),
        );
        saveDraft({ name: filename(), svg });
        session.markSaved();
        setNotice({ message: "SVG 已下载" });
      }),
    png: () => {
      if (!session) return;
      setExporting(true);
      void downloadPng(
        session.serialize(),
        filename(),
        state.width,
        state.height,
      )
        .then(() => setNotice({ message: "PNG 已下载" }))
        .catch((error: unknown) =>
          setNotice({
            message:
              error instanceof Error
                ? error.message
                : "PNG 导出失败，请保存为 SVG。",
            error: true,
          }),
        )
        .finally(() => setExporting(false));
    },
    source: () => {
      if (session) {
        setSource(session.serialize());
        setDialog("source");
      }
    },
    newDocument: () => confirm(() => setDialog("new")),
    help: () => setDialog("help"),
  };

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!session || dialog || confirmation) return;
      const target = event.target;
      const shortcut = shortcutFor(event);
      const editingField =
        target instanceof Element &&
        target.closest(
          "input,textarea,select,[contenteditable=true],[role=menu],[role=combobox],[role=listbox]",
        );
      if (editingField && shortcut?.kind !== "file") return;
      if (editingField && target instanceof HTMLElement) target.blur();
      if (event.key === "Escape") {
        session.setTool("select");
        session.canvas.clearSelection();
        return;
      }
      if (shortcut) {
        event.preventDefault();
        run(() => {
          if (shortcut.kind === "tool") session.setTool(shortcut.value);
          else if (shortcut.kind === "command") session.command(shortcut.value);
          else if (shortcut.value === "actual") session.zoomTo(1);
          else actions[shortcut.value]();
        });
      } else if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          event.key,
        ) &&
        state.selected
      ) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const axis =
          event.key === "ArrowLeft" || event.key === "ArrowRight" ? "x" : "y";
        const direction =
          event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        run(() =>
          session.property(axis, state.selected![axis] + step * direction),
        );
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  });

  const importFile = async (file: File) => {
    try {
      const source = prepareSvg(await file.text());
      confirm(() =>
        run(() => {
          session?.load(source);
          setName(file.name.replace(/\.[^.]+$/, "") + ".svg");
          fit();
          setNotice({ message: "SVG 已打开" });
        }),
      );
    } catch (error) {
      setNotice({
        message: error instanceof Error ? error.message : "文件读取失败。",
        error: true,
      });
    }
  };

  return (
    <div
      className={`editor-shell${inspector ? "" : " inspector-hidden"}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && session) void importFile(file);
      }}
    >
      <Header
        session={session}
        state={state}
        name={name}
        setName={setName}
        actions={actions}
        run={run}
        rulers={rulers}
        setRulers={setRulers}
        checker={checker}
        setChecker={setChecker}
        inspector={inspector}
        setInspector={setInspector}
      />
      <div className="editor-body">
        <Toolbar session={session} state={state} run={run} />
        <Workspace
          hostRef={hostRef}
          viewportRef={viewportRef}
          session={session}
          state={state}
          rulers={rulers}
          checker={checker}
          run={run}
        />
        {session && inspector && (
          <Inspector
            session={session}
            state={state}
            run={run}
            close={() => setInspector(false)}
          />
        )}
      </div>
      <StatusBar session={session} state={state} fit={fit} run={run} />
      <input
        ref={fileRef}
        type="file"
        accept=".svg,image/svg+xml"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importFile(file);
          e.target.value = "";
        }}
      />
      <input
        id="text-input"
        ref={textRef}
        className="engine-text-input"
        aria-label="画布文字输入"
        autoComplete="off"
        spellCheck={false}
        onInput={(e) => session?.setText(e.currentTarget.value)}
      />
      {notice && (
        <div
          className={`notice${notice.error ? " notice-error" : ""}`}
          role={notice.error ? "alert" : "status"}
        >
          {notice.error ? <CircleAlert size={17} /> : <Check size={17} />}
          <span>{notice.message}</span>
          <IconButton
            icon={X}
            label="关闭提示"
            onClick={() => setNotice(null)}
          />
        </div>
      )}
      {exporting && (
        <div className="export-status" role="status">
          正在生成 PNG…
        </div>
      )}
      <EditorDialogs
        dialog={dialog}
        setDialog={setDialog}
        source={source}
        setSource={setSource}
        confirmation={confirmation}
        setConfirmation={setConfirmation}
        session={session}
        setName={setName}
        fit={fit}
        run={run}
      />
    </div>
  );
}
