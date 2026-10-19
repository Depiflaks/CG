import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";
import { createScene } from "./scene.ts";

export function mountRayTracing(container: HTMLElement, shadows: boolean): () => void {
  const canvas = createCanvas({ tabIndex: 0, label: "Трассировка лучей. Перетаскивайте для вращения камеры." });
  const scene = createScene(shadows);
  container.append(canvas);
  try {
    const gl = createContext(canvas, "webgl2", { alpha: false, antialias: false });
    if (gl === null) throw new Error("Для этого задания требуется WebGL2.");
    const application = new Application(canvas, gl, scene);
    return (): void => { application.dispose(); canvas.remove(); };
  } catch (error) {
    canvas.remove();
    throw error;
  }
}
