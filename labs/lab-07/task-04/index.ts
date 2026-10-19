import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";
import "./style.css";

function createPanel(): HTMLElement {
  const panel = document.createElement("header");
  panel.className = "ripple-panel";
  panel.innerHTML = `
    <div><a href="#/">Все задания</a><h1>Волны</h1></div>
    <p>Щёлкните в любой точке изображения — из неё начнут расходиться волны.
    Каждый щелчок меняет направление перехода. Быстрые щелчки выполняются по очереди.</p>
    <div><button type="button" disabled>Волна из центра</button>
    <output aria-live="polite">Загрузка изображений…</output></div>`;
  return panel;
}

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ tabIndex: 0, label: "Волновой переход. Нажмите на изображение или Enter для запуска волны." });
  const panel = createPanel();
  canvas.classList.add("ripple-canvas");
  container.classList.add("ripple-task");
  container.append(panel, canvas);
  const cleanup = (): void => {
    panel.remove();
    canvas.remove();
    container.classList.remove("ripple-task");
  };
  try {
    const gl = createContext(canvas, "webgl2", { alpha: false });
    if (gl === null) throw new Error("Для этого задания требуется WebGL2.");
    const status = panel.querySelector("output");
    const play = panel.querySelector("button");
    if (status === null || play === null) throw new Error("Не удалось создать панель управления.");
    const application = new Application(canvas, gl, status, play);
    return (): void => { application.dispose(); cleanup(); };
  } catch (error) {
    cleanup();
    throw error;
  }
}
