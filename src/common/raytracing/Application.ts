import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { OrbitCamera } from "@/src/common/graphics/OrbitCamera.ts";
import { CameraControls } from "./CameraControls.ts";
import { Renderer } from "./Renderer.ts";
import type { Scene } from "./scene.ts";

export class Application {
  private readonly camera = new OrbitCamera({
    target: [0, 0.8, 0], yaw: 0.35, pitch: 0.45, distance: 9, minDistance: 5, maxDistance: 18,
  });
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;
  private frame = 0;
  private lost = false;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext,
    private readonly scene: Scene) {
    this.renderer = new Renderer(gl);
    const signal = this.events.signal;
    new CameraControls(canvas, this.camera, this.redraw, signal);
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, 1.5);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.events.abort();
    this.unbindResize();
    this.renderer.dispose();
  }

  private readonly redraw = (): void => {
    if (this.lost || this.disposed || this.frame !== 0) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.renderer.draw(this.scene, this.camera.eye, this.camera.target);
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
