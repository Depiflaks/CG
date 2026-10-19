import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { ObjectRotation } from "@/src/common/graphics/ObjectRotation.ts";
import { RotationControls } from "@/src/common/canvas/RotationControls.ts";
import { createPolyhedron } from "./geometry/polyhedron.ts";
import { Renderer } from "./graphics/Renderer.ts";
import { showStatus, type TaskView } from "./view.ts";
import { OrbitCamera } from "@/src/common/graphics/OrbitCamera.ts";

export class Application {
  private readonly camera = new OrbitCamera();
  private readonly rotation = new ObjectRotation(this.camera.eye, this.camera.target);
  private readonly polyhedron = createPolyhedron();
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;

  constructor(private readonly view: TaskView, private readonly gl: WebGL2RenderingContext) {
    this.renderer = new Renderer(gl, this.polyhedron);
    const signal = this.events.signal;
    new RotationControls(view.canvas, this.rotation, this.redraw, signal);
    view.opacity.addEventListener("input", this.redraw, { signal });
    view.lighting.addEventListener("change", this.redraw, { signal });
    view.canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    view.canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    this.unbindResize = bindCanvasResize(view.canvas, this.resize, 2);
  }

  dispose(): void {
    this.events.abort();
    this.unbindResize();
    this.renderer.dispose();
  }

  private readonly redraw = (): void => {
    const opacity = this.view.opacity.valueAsNumber / 100;
    this.view.output.value = `${Math.round(opacity * 100).toString()}%`;
    this.renderer.draw(this.camera.eye, this.rotation.modelMatrix(), { opacity, lighting: this.view.lighting.checked });
  };

  private readonly resize = (): void => {
    if (this.gl.isContextLost()) return;
    this.redraw();
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    showStatus(this.view, "Контекст WebGL потерян. Ожидание восстановления…");
  };

  private readonly contextRestored = (): void => {
    try {
      this.renderer = new Renderer(this.gl, this.polyhedron);
      showStatus(this.view, "");
      this.resize();
    } catch (error) {
      showStatus(this.view, error instanceof Error ? error.message : "Не удалось восстановить WebGL.");
    }
  };
}
