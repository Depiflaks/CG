import { bindCanvasResize, createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Renderer } from "./Renderer.ts";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ label: "Прямоугольник с пятиконечной звездой" });
  container.append(canvas);
  try {
    const gl = createContext(canvas, "webgl2", { alpha: false });
    if (!gl) throw new Error("Для этого задания требуется WebGL2.");
    const renderer = new Renderer(gl);
    const unbindResize = bindCanvasResize(canvas, () => { renderer.draw(); }, 2);
    return (): void => {
      unbindResize();
      renderer.dispose();
      canvas.remove();
    };
  } catch (error) {
    canvas.remove();
    throw error;
  }
}
