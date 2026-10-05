import { Vector2 } from "@/src/common/graphics/vector2.ts";
import { createCanvas } from "@/src/common/canvas/index.ts";
import { createContext } from "@/src/common/webgl/index.ts";
import type { ControlPoints } from "./bezier.ts";
import { createRenderer } from "./renderer.ts";
import { bindInteraction } from "./interaction.ts";

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas();
  container.append(canvas);
  const gl = createContext(canvas, "webgl2");
  if (gl === null) throw new Error("WebGL2 is not supported by this browser.");
  const renderer = createRenderer(gl);
  const points: ControlPoints = [
    new Vector2(-0.75, -0.45),
    new Vector2(-0.35, 0.7),
    new Vector2(0.35, -0.7),
    new Vector2(0.75, 0.45),
  ];
  const render = (): void => {
    renderer.render(points);
  };
  const unbind = bindInteraction(canvas, points, render);
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.round(bounds.width);
  canvas.height = Math.round(bounds.height);
  canvas.style.width = `${String(bounds.width)}px`;
  canvas.style.height = `${String(bounds.height)}px`;
  render();

  return (): void => {
    unbind();
    renderer.dispose();
    canvas.remove();
  };
}
