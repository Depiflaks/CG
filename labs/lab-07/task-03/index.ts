import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";
import { createMorphInput } from "./panel.ts";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ tabIndex: 0, label: "Морфинг параболоидов. Перетаскивайте для вращения объекта." });
  const input = createMorphInput();
  container.append(input, canvas);
  try {
    const gl = createContext(canvas, "webgl2", { antialias: true, alpha: false });
    if (gl === null) throw new Error("Для этого задания требуется WebGL2.");
    const application = new Application(canvas, gl, input);
    return (): void => {
      application.dispose();
      canvas.remove();
      input.remove();
    };
  } catch (error) {
    canvas.remove();
    input.remove();
    throw error;
  }
}
