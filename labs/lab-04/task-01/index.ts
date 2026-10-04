import { Application } from "./Application.ts";
import { createView, showStatus } from "./view.ts";

export function mount(container: HTMLElement): () => void {
  const view = createView(container);
  try {
    const gl = view.canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (gl === null) throw new Error("Для этого задания требуется браузер с поддержкой WebGL2.");
    const application = new Application(view, gl);
    return (): void => {
      application.dispose();
      view.root.remove();
    };
  } catch (error) {
    showStatus(view, error instanceof Error ? error.message : "Не удалось запустить приложение.");
    return (): void => { view.root.remove(); };
  }
}
