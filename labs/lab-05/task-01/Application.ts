import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { OrbitCamera } from "./camera/OrbitCamera.ts";
import { OrbitControls } from "./camera/OrbitControls.ts";
import { createDesk } from "./geometry/desk.ts";
import { Renderer } from "./graphics/Renderer.ts";

export class Application {
  private readonly camera = new OrbitCamera();
  private readonly geometry = createDesk();
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext,
    private readonly hint: HTMLElement) {
    this.renderer = this.createRenderer();
    const signal = this.events.signal;
    new OrbitControls(canvas, this.camera, this.redraw, signal);
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, 2);
  }

  dispose(): void {
    this.events.abort();
    this.unbindResize();
    this.renderer.dispose();
  }

  private createRenderer(): Renderer {
    return new Renderer(this.gl, this.geometry, this.redraw, () => {
      this.hint.textContent = "Не удалось загрузить текстуру textures/wood.svg. Проверьте файл и обновите страницу.";
    });
  }

  private readonly redraw = (): void => {
    this.renderer.draw(this.camera.eye, this.camera.target);
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    this.renderer.dispose();
  };

  private readonly contextRestored = (): void => {
    this.renderer = this.createRenderer();
    this.redraw();
  };
}
