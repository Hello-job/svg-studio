import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./styles.css";

// SVG-Edit 的内部模块共享画布实例，编辑器在页面生命周期内只挂载一次。
createRoot(document.getElementById("root")!).render(<App />);
