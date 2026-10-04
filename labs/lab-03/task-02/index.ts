import { EngineApplication } from "./EngineApplication.ts";

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.className = "graphics-canvas";
  canvas.tabIndex = 0;
  canvas.setAttribute("aria-label", "Двигатель внутреннего сгорания в разрезе. Нажмите или используйте пробел для паузы.");
  return canvas;
}

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas();
  container.append(canvas);
  try {
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (gl === null) throw new Error("WebGL2 support is required for this task.");
    const application = new EngineApplication(canvas, gl);
    return (): void => {
      application.dispose();
      canvas.remove();
    };
  } catch (error) {
    const message = document.createElement("p");
    message.textContent = error instanceof Error ? error.message : "Failed to initialize WebGL2.";
    canvas.replaceWith(message);
    return (): void => { message.remove(); };
  }
}
