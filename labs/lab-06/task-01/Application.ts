import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { OrbitCamera } from "@/src/common/graphics/OrbitCamera.ts";
import { ObjectRotation } from "@/src/common/graphics/ObjectRotation.ts";
import { RotationControls } from "@/src/common/canvas/RotationControls.ts";
import type { ModelPart } from "./formats/types.ts";
import { Renderer } from "./graphics/Renderer.ts";
import { loadScene } from "./scene.ts";

const MAX_PIXEL_RATIO = 2;
const CONTROLS_HINT = "Вращение сцены — мышь / стрелки · Масштаб — колесо";
const LINE_PIXELS = 16;
const MAX_WHEEL_DELTA = 300;
const ZOOM_SENSITIVITY = 0.001;
const MIN_SCENE_SCALE = 0.5;
const MAX_SCENE_SCALE = 2.4;

export class Application {
  private readonly camera = new OrbitCamera({
    target: [0, 1, 0], yaw: 0.6, pitch: 0.55, distance: 12,
  });
  private readonly rotation = new ObjectRotation();
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private parts: ModelPart[] = [];
  private renderer: Renderer | undefined;
  private sceneScale = 1;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext,
    private readonly status: HTMLElement) {
    const signal = this.events.signal;
    new RotationControls(canvas, this.rotation, this.redraw, signal);
    canvas.addEventListener("wheel", this.scaleScene, { signal, passive: false });
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, MAX_PIXEL_RATIO);
    void loadScene(signal).then(this.showScene).catch(this.showError);
  }

  dispose(): void {
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
    this.renderer = new Renderer(this.gl, this.parts, this.redraw, this.showError);
    this.status.textContent = CONTROLS_HINT;
    this.status.dataset.state = "ready";
    this.redraw();
  }

  private readonly redraw = (): void => {
    this.renderer?.draw(this.camera.eye, this.camera.target,
      this.rotation.modelMatrix(this.camera.target, this.sceneScale));
  };

  private readonly scaleScene = (event: WheelEvent): void => {
    event.preventDefault();
    const canvas = event.currentTarget as HTMLCanvasElement;
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? LINE_PIXELS
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? canvas.clientHeight : 1;
    const delta = Math.max(-MAX_WHEEL_DELTA, Math.min(MAX_WHEEL_DELTA, event.deltaY * unit));
    this.sceneScale = Math.max(MIN_SCENE_SCALE,
      Math.min(MAX_SCENE_SCALE, this.sceneScale * Math.exp(-delta * ZOOM_SENSITIVITY)));
    this.redraw();
  };

  private readonly showError = (error: unknown): void => {
    if (this.events.signal.aborted) return;
    this.status.textContent = error instanceof Error ? error.message : String(error);
    this.status.dataset.state = "error";
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    this.renderer?.dispose();
    this.renderer = undefined;
    this.status.textContent = "Контекст WebGL потерян. Ожидание восстановления…";
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
