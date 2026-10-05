import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { EngineApplication } from "./EngineApplication.ts";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({
    tabIndex: 0,
    touchAction: "auto",
  });
  container.append(canvas);
  try {
    const gl = createContext(canvas, "webgl2", {
      antialias: true,
      alpha: false,
    });
    if (gl === null)
      throw new Error("WebGL2 is not supported by this browser.");
    const application = new EngineApplication(canvas, gl);
    return (): void => {
      application.dispose();
      canvas.remove();
    };
  } catch (error) {
    const message = document.createElement("p");
    message.textContent =
      error instanceof Error ? error.message : "Failed to initialize WebGL2.";
    canvas.replaceWith(message);
    return (): void => {
      message.remove();
    };
  }
}
