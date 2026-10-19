import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";
import { createPanel } from "./panel.ts";
import "./style.css";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ tabIndex: 0, label: "Морфинг параболоидов. Перетаскивайте для вращения камеры." });
  const panel = createPanel();
  canvas.classList.add("morph-canvas");
  container.classList.add("morph-task");
  container.append(canvas, panel);
  try {
    const gl = createContext(canvas, "webgl2", { antialias: true, alpha: false });
    if (gl === null) throw new Error("Для этого задания требуется WebGL2.");
    const application = new Application(canvas, gl, panel);
    return (): void => {
      application.dispose();
      canvas.remove();
      panel.remove();
      container.classList.remove("morph-task");
    };
  } catch (error) {
    canvas.remove();
    panel.remove();
    container.classList.remove("morph-task");
    throw error;
  }
}
