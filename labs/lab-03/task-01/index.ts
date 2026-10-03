import { Vector2D } from "@/src/common/graphics/Vector2D.ts";
import type { ControlPoints } from "./bezier.ts";
import { createRenderer } from "./renderer.ts";
import { bindInteraction } from "./interaction.ts";

export function mount(container: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  canvas.className = "graphics-canvas";
  canvas.style.touchAction = "none";
  canvas.setAttribute("aria-label", canvas.title);
  const gl = canvas.getContext("webgl");
  if (gl === null) throw new Error("WebGL is not supported by this browser.");
  const renderer = createRenderer(gl);
  const points: ControlPoints = [
    new Vector2D(-0.75, -0.45),
    new Vector2D(-0.35, 0.7),
    new Vector2D(0.35, -0.7),
    new Vector2D(0.75, 0.45),
  ];
  container.append(canvas);
  const render = (): void => {
    renderer.render(points);
  };
  const resize = (): void => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    render();
  };
  const unbind = bindInteraction(canvas, points, render);
  window.addEventListener("resize", resize);
  resize();

  return (): void => {
    window.removeEventListener("resize", resize);
    unbind();
    renderer.dispose();
    canvas.remove();
  };
}
