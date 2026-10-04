import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({
    tabIndex: 0,
    label: "Hyperbolic paraboloid. Drag or use arrow keys to rotate, scroll to zoom.",
  });
  container.append(canvas);
  try {
    const gl = createContext(canvas, "webgl2", { antialias: true, alpha: false });
    if (gl === null) throw new Error("This task requires a browser with WebGL2 support.");
    const application = new Application(canvas, gl);
    return (): void => {
      application.dispose();
      canvas.remove();
    };
  } catch (error) {
    canvas.remove();
    throw error instanceof Error ? error : new Error("Failed to start the application.");
  }
}
