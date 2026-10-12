import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";
import "./style.css";

function createStatus(): HTMLElement {
  const status = document.createElement("div");
  status.className = "maze-status";
  status.setAttribute("role", "status");
  status.textContent = "Загрузка текстур…";
  return status;
}

function createApplication(canvas: HTMLCanvasElement, status: HTMLElement): Application {
  const gl = createContext(canvas, "webgl2", { antialias: true, alpha: false });
  if (gl === null) throw new Error("Для этого задания требуется WebGL2.");
  return new Application(canvas, gl, status);
}

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({
    tabIndex: 0,
    label: "Лабиринт. WASD или стрелки вверх/вниз — движение, стрелки влево/вправо или Q/E — поворот.",
  });
  const status = createStatus();
  container.append(canvas, status);
  try {
    const application = createApplication(canvas, status);
    canvas.focus({ preventScroll: true });
    return (): void => {
      application.dispose();
      canvas.remove();
      status.remove();
    };
  } catch (error) {
    canvas.remove();
    status.remove();
    throw error instanceof Error ? error : new Error("Не удалось запустить приложение.");
  }
}
