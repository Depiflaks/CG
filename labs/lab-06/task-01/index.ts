import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";
import "./style.css";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ tabIndex: 0,
    label: "Комната из OBJ-моделей. Перетаскивайте для вращения сцены, колесо — масштаб." });
  const status = document.createElement("p");
  status.className = "obj-scene-status";
  status.setAttribute("role", "status");
  status.textContent = "Загрузка OBJ-моделей и материалов…";
  container.append(canvas, status);
  try {
    const gl = createContext(canvas, "webgl2", { antialias: true, alpha: false });
    if (!gl) throw new Error("Для этого задания требуется WebGL2.");
    const application = new Application(canvas, gl, status);
    return (): void => {
      application.dispose();
      canvas.remove();
      status.remove();
    };
  } catch (error) {
    canvas.remove();
    status.remove();
    throw error;
  }
}
