import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { OrbitCamera } from "@/src/common/graphics/OrbitCamera.ts";
import { RotationControls } from "@/src/common/canvas/RotationControls.ts";
import { ObjectRotation } from "@/src/common/graphics/ObjectRotation.ts";
import { createDesk } from "./geometry/desk.ts";
import { Renderer } from "./graphics/Renderer.ts";

export class Application {
  private readonly camera = new OrbitCamera({
    target: [0, 0.9, 0], yaw: 0.5, pitch: 0.38, minDistance: 3.4, maxDistance: 11,
  });
  private readonly rotation = new ObjectRotation(this.camera.eye, this.camera.target);
  private readonly geometry = createDesk();
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext,
    private readonly hint: HTMLElement) {
    this.renderer = this.createRenderer();
    const signal = this.events.signal;
    new RotationControls(canvas, this.rotation, this.redraw, signal);
    canvas.addEventListener("wheel", this.wheel, { signal, passive: false });
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
    this.renderer.draw(this.camera.eye, this.camera.target, this.centeredModelMatrix());
  };

  private centeredModelMatrix(): Float32Array {
    const model = this.rotation.modelMatrix();
    const center = this.camera.target[1];
    model[12] = -(model[4] ?? 0) * center;
    model[13] = center - (model[5] ?? 0) * center;
    model[14] = -(model[6] ?? 0) * center;
    return model;
  }

  private readonly wheel = (event: WheelEvent): void => {
    event.preventDefault();
    const canvas = event.currentTarget as HTMLCanvasElement;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
    this.camera.zoom(Math.max(-300, Math.min(300, event.deltaY * unit)));
    this.redraw();
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
