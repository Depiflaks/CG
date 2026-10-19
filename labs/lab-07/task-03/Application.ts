import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { RotationControls } from "@/src/common/canvas/RotationControls.ts";
import { ObjectRotation } from "@/src/common/graphics/ObjectRotation.ts";
import { OrbitCamera } from "@/src/common/graphics/OrbitCamera.ts";
import { Renderer } from "./Renderer.ts";

export class Application {
  private readonly camera = new OrbitCamera({
    target: [0, 0.35, 0], yaw: 0.6, pitch: 0.65, distance: 7, minDistance: 4, maxDistance: 14,
  });
  private readonly rotation = new ObjectRotation(this.eye, [0, 0, 0.35], [0, 0, 1]);
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext,
    private readonly input: HTMLInputElement) {
    this.renderer = new Renderer(gl);
    const signal = this.events.signal;
    new RotationControls(canvas, this.rotation, this.redraw, signal);
    this.input.addEventListener("input", this.redraw, { signal });
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
    this.renderer.draw(this.eye, this.rotation.modelMatrix([0, 0, 0.35]),
      Number(this.input.value), false);
  };

  private get eye(): [number, number, number] {
    const [x, height, depth] = this.camera.eye;
    return [x, -depth, height];
  }

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    this.renderer.dispose();
  };

  private readonly contextRestored = (): void => {
    this.renderer = new Renderer(this.gl);
    this.redraw();
  };
}
