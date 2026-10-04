import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { OrbitCamera } from "./camera/OrbitCamera.ts";
import { OrbitControls } from "./camera/OrbitControls.ts";
import { createSurface } from "./geometry.ts";
import { Renderer } from "./graphics/Renderer.ts";

export class Application {
  private readonly camera = new OrbitCamera();
  private readonly surface = createSurface();
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext) {
    this.renderer = new Renderer(gl, this.surface);
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

  private readonly redraw = (): void => {
    this.renderer.draw(this.camera.eye);
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
  };

  private readonly contextRestored = (): void => {
    this.renderer = new Renderer(this.gl, this.surface);
    this.redraw();
  };
}
