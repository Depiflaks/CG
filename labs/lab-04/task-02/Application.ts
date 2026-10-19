import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { OrbitCamera } from "@/src/common/graphics/OrbitCamera.ts";
import { ObjectRotation } from "@/src/common/graphics/ObjectRotation.ts";
import { RotationControls } from "@/src/common/canvas/RotationControls.ts";
import { createSurface } from "./geometry.ts";
import { Renderer } from "./graphics/Renderer.ts";

export class Application {
  private readonly camera = new OrbitCamera();
  private readonly rotation = new ObjectRotation(this.camera.eye, this.camera.target);
  private readonly surface = createSurface();
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly gl: WebGL2RenderingContext,
  ) {
    this.renderer = new Renderer(gl, this.surface);
    const signal = this.events.signal;
    new RotationControls(canvas, this.rotation, this.redraw, signal);
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, {
      signal,
    });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, 2);
  }

  dispose(): void {
    this.events.abort();
    this.unbindResize();
    this.renderer.dispose();
  }

  private readonly redraw = (): void => {
    this.renderer.draw(this.camera.eye, this.rotation.modelMatrix());
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
  };

  private readonly contextRestored = (): void => {
    this.renderer = new Renderer(this.gl, this.surface);
    this.redraw();
  };
}
