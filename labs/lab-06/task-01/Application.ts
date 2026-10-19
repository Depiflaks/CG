import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { OrbitCamera } from "@/src/common/graphics/OrbitCamera.ts";
import { ObjectRotation } from "@/src/common/graphics/ObjectRotation.ts";
import { RotationControls } from "@/src/common/canvas/RotationControls.ts";
import type { ModelPart } from "./formats/types.ts";
import { Renderer } from "./graphics/Renderer.ts";
import { loadScene } from "./scene.ts";

const MAX_PIXEL_RATIO = 2;

export class Application {
  private readonly camera = new OrbitCamera({
    target: [0, 1, 0],
    yaw: 0.6,
    pitch: 0.55,
    distance: 12,
  });
  private readonly rotation = new ObjectRotation(
    this.camera.eye,
    this.camera.target,
  );
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private parts: ModelPart[] = [];
  private renderer: Renderer | undefined;
  private animationFrame = 0;
  private animationTime = 0;
  private previousFrame: number | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly gl: WebGL2RenderingContext,
  ) {
    const signal = this.events.signal;
    new RotationControls(canvas, this.rotation, this.redraw, signal);
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, {
      signal,
    });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, MAX_PIXEL_RATIO);
    void loadScene(signal).then(this.showScene).catch(this.showError);
  }

  dispose(): void {
    this.stopAnimation();
    this.events.abort();
    this.unbindResize();
    this.renderer?.dispose();
  }

  private readonly showScene = (parts: ModelPart[]): void => {
    if (this.events.signal.aborted) return;
    this.parts = parts;
    if (!this.gl.isContextLost()) this.createRenderer();
  };

  private createRenderer(): void {
    this.renderer = new Renderer(
      this.gl,
      this.parts,
      this.redraw,
      this.showError,
    );
    this.redraw();
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  private readonly animate = (time: number): void => {
    if (this.previousFrame !== undefined) this.animationTime += (time - this.previousFrame) / 1000;
    this.previousFrame = time;
    this.redraw();
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private stopAnimation(): void {
    cancelAnimationFrame(this.animationFrame);
    this.previousFrame = undefined;
  }

  private readonly redraw = (): void => {
    this.renderer?.draw(
      this.camera.eye,
      this.camera.target,
      this.rotation.modelMatrix(this.camera.target),
      this.animationTime,
    );
  };

  private readonly showError = (error: unknown): void => {
    if (this.events.signal.aborted) return;
    console.error(error);
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    this.stopAnimation();
    this.renderer?.dispose();
    this.renderer = undefined;
  };

  private readonly contextRestored = (): void => {
    if (this.parts.length === 0) return;
    try {
      this.createRenderer();
    } catch (error) {
      this.showError(error);
    }
  };
}
