import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { RotationControls } from "@/src/common/canvas/RotationControls.ts";
import { ObjectRotation } from "@/src/common/graphics/ObjectRotation.ts";
import { Renderer } from "./Renderer.ts";
import { EYE, TARGET, UP } from "./scene.ts";

export class Application {
  private readonly rotation = new ObjectRotation(EYE, TARGET, UP);
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;
  private frame = 0;
  private lost = false;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext) {
    this.renderer = new Renderer(gl);
    const signal = this.events.signal;
    new RotationControls(canvas, this.rotation, this.redraw, signal);
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, 1.5);
  }

  dispose(): void {
    this.events.abort();
    cancelAnimationFrame(this.frame);
    this.unbindResize();
    this.renderer.dispose();
  }

  private readonly redraw = (): void => {
    if (this.lost || this.events.signal.aborted || this.frame !== 0) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.renderer.draw(this.rotation.modelMatrix());
    });
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    this.lost = true;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  };

  private readonly contextRestored = (): void => {
    this.renderer = new Renderer(this.gl);
    this.lost = false;
    this.redraw();
  };
}
