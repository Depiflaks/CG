import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ tabIndex: 0, label: "Волновой переход. Нажмите на изображение или Enter для запуска волны." });
  container.append(canvas);
  try {
    const gl = createContext(canvas, "webgl2", { alpha: false });
    if (gl === null) throw new Error("Для этого задания требуется WebGL2.");
    const application = new Application(canvas, gl);
    return (): void => {
      application.dispose();
      canvas.remove();
    };
  } catch (error) {
    canvas.remove();
    throw error;
  }
}
