import { OrbitCamera } from "./camera/OrbitCamera.ts";
import { OrbitControls } from "./camera/OrbitControls.ts";
import { createPolyhedron } from "./geometry/polyhedron.ts";
import { Renderer } from "./graphics/Renderer.ts";
import { showStatus, type TaskView } from "./view.ts";

export class Application {
  private readonly camera = new OrbitCamera();
  private readonly polyhedron = createPolyhedron();
  private readonly events = new AbortController();
  private readonly observer: ResizeObserver;
  private renderer: Renderer;

  constructor(private readonly view: TaskView, private readonly gl: WebGL2RenderingContext) {
    this.renderer = new Renderer(gl, this.polyhedron);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(view.canvas);
    const signal = this.events.signal;
    new OrbitControls(view.canvas, this.camera, this.redraw, signal);
    view.opacity.addEventListener("input", this.redraw, { signal });
    view.lighting.addEventListener("change", this.redraw, { signal });
    view.reset.addEventListener("click", this.reset, { signal });
    view.canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    view.canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    window.addEventListener("resize", this.resize, { signal });
    this.resize();
  }

  dispose(): void {
    this.events.abort();
    this.observer.disconnect();
    this.renderer.dispose();
  }

  private readonly redraw = (): void => {
    const opacity = this.view.opacity.valueAsNumber / 100;
    this.view.output.value = `${Math.round(opacity * 100).toString()}%`;
    this.renderer.draw(this.camera.eye, { opacity, lighting: this.view.lighting.checked });
  };

  private readonly resize = (): void => {
    if (this.gl.isContextLost()) return;
    const canvas = this.view.canvas;
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    this.redraw();
  };

  private readonly reset = (): void => {
    this.camera.reset();
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
