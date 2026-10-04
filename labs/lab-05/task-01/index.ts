import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import { Application } from "./Application.ts";
import "./style.css";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ tabIndex: 0,
    label: "Компьютерный стол. Перетаскивайте мышью для вращения, колесо — масштаб." });
  const hint = document.createElement("p");
  hint.className = "desktop-controls";
  hint.textContent = "Вращение — левая кнопка мыши / стрелки · Масштаб — колесо";
  container.append(canvas, hint);
  try {
    const gl = createContext(canvas, "webgl2", { antialias: true, alpha: false });
    if (gl === null) throw new Error("Для этого задания требуется поддержка WebGL2.");
    const application = new Application(canvas, gl, hint);
    return (): void => {
      application.dispose();
      canvas.remove();
      hint.remove();
    };
  } catch (error) {
    canvas.remove();
    hint.remove();
    throw error;
  }
}
