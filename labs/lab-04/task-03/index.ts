import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({
    tabIndex: 0,
    label: "Лабиринт. WASD или стрелки вверх/вниз — движение, стрелки влево/вправо или Q/E — поворот.",
  });
  container.append(canvas);
  try {
    const gl = createContext(canvas, "webgl2", { antialias: true, alpha: false });
    if (gl === null) throw new Error("Для этого задания требуется WebGL2.");
    const application = new Application(canvas, gl);
    canvas.focus({ preventScroll: true });
    return (): void => {
      application.dispose();
      canvas.remove();
    };
  } catch (error) {
    canvas.remove();
    throw error instanceof Error ? error : new Error("Не удалось запустить приложение.");
  }
}
