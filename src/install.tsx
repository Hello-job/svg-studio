import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "./components/ui/button";
import { SvgStudio } from "./components/svg-studio";
import type { SvgStudioDocument } from "./components/svg-studio";
import { applyTheme, DEFAULT_THEME } from "./lib/theme";
import "./styles.css";

applyTheme(DEFAULT_THEME);
const editorUrl = new URL(import.meta.env.BASE_URL, window.location.href).href;
const registryUrl = new URL("r/svg-studio.json", editorUrl).href;
const command = `pnpm dlx shadcn@latest add ${registryUrl}`;
const example = `"use client";

import { SvgStudio } from "@/components/svg-studio";

export default function Editor() {
  return (
    <SvgStudio
      editorUrl="${editorUrl}"
      filename="my-design.svg"
      onChange={(svg) => console.log(svg)}
      onSave={({ svg, filename }) => {
        // 在这里保存到你的项目。
        console.log(filename, svg);
      }}
    />
  );
}`;

export function InstallPage() {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [saved, setSaved] = useState<SvgStudioDocument | null>(null);
  const [changed, setChanged] = useState(false);
  let previewStatus = "试着修改图形，再点击保存 SVG";
  if (changed) previewStatus = "已收到编辑结果";
  if (saved) previewStatus = `已接收 ${saved.filename}，可继续编辑`;
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-5 py-8 sm:px-10 sm:py-12">
      <nav className="flex items-center justify-between text-sm">
        <a
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          href={editorUrl}
        >
          <ArrowLeft size={16} /> 在线编辑器
        </a>
        <a
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          href="https://github.com/Hello-job/svg-studio"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub <ExternalLink size={14} />
        </a>
      </nav>
      <header className="max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          在你的项目里编辑 SVG。
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          用 shadcn CLI 安装 React 组件源码，传入 SVG，接收编辑结果。支持
          Next.js 和 Vite，文件只在浏览器内处理。
        </p>
      </header>
      <section className="space-y-3" aria-labelledby="install-heading">
        <h2 id="install-heading" className="text-base font-medium">
          安装
        </h2>
        <p className="text-sm text-muted-foreground">
          先在 React 项目中初始化 shadcn/ui 与 Tailwind CSS，再执行：
        </p>
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
          <code className="min-w-0 flex-1 break-all text-sm leading-7">
            {command}
          </code>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="复制安装命令"
            onClick={() => {
              void navigator.clipboard
                .writeText(command)
                .then(() => {
                  setCopied(true);
                  setCopyFailed(false);
                })
                .catch(() => setCopyFailed(true));
            }}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
        {copyFailed && (
          <p role="alert" className="text-sm text-muted-foreground">
            无法访问剪贴板，请选中上方命令复制。
          </p>
        )}
      </section>
      <section
        className="grid gap-6 lg:grid-cols-[1.15fr_1fr]"
        aria-labelledby="usage-heading"
      >
        <div className="space-y-3">
          <h2 id="usage-heading" className="text-base font-medium">
            使用
          </h2>
          <pre className="overflow-x-auto rounded-lg border bg-card p-5 text-xs leading-6">
            <code>{example}</code>
          </pre>
        </div>
        <div className="space-y-5 text-sm leading-6 text-muted-foreground lg:pt-9">
          <p>
            安装得到 <code className="text-foreground">SvgStudio</code>{" "}
            与通信协议的 TypeScript 源码，可直接修改。完整编辑器通过 iframe
            独立运行，避免引擎事件和全局样式影响宿主页面，也支持多个组件和重复挂载。
          </p>
          <p>
            可通过 <code className="text-foreground">defaultValue</code>{" "}
            提供初始 SVG，或使用{" "}
            <code className="text-foreground">value / onChange</code> 受控编辑。
            <code className="text-foreground">onReady</code>{" "}
            返回清理后的初始文档，
            <code className="text-foreground">onError</code> 接收载入错误。SVG
            输入上限为 5 MB。
          </p>
          <p>
            传入 <code className="text-foreground">onSave</code>{" "}
            后，保存按钮将文档交给回调；未传入时直接下载。组件内不读取或写入在线编辑器的本机草稿。
          </p>
          <p>
            需要完全自行托管或修改编辑器界面时，部署 GitHub 仓库，将{" "}
            <code className="text-foreground">editorUrl</code>{" "}
            换成自己的地址。每个 iframe 内仍只创建一个 SVG-Edit 实例。
          </p>
          <p>
            实验版仍有部分编辑限制，见{" "}
            <a
              href="https://github.com/Hello-job/svg-studio/blob/main/docs/known-issues.md"
              className="underline underline-offset-4"
            >
              已知问题
            </a>
            。
          </p>
        </div>
      </section>
      <section className="space-y-4" aria-labelledby="preview-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="preview-heading" className="text-base font-medium">
            组件预览
          </h2>
          <p role="status" className="text-xs text-muted-foreground">
            {previewStatus}
          </p>
        </div>
        <SvgStudio
          editorUrl={editorUrl}
          filename="my-design.svg"
          onChange={() => setChanged(true)}
          onSave={setSaved}
        />
        {saved && (
          <p className="text-xs text-muted-foreground">
            保存回调已收到 SVG 文档（{saved.svg.length.toLocaleString()}{" "}
            字符）。此预览不会上传文件。
          </p>
        )}
      </section>
      <footer className="border-t pt-6 text-xs text-muted-foreground">
        SVG Studio · MIT License · React + SVG-Edit + shadcn/ui
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<InstallPage />);
