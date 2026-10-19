import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { OrbitCamera } from "@/src/common/graphics/OrbitCamera.ts";
import { OrbitControls } from "./OrbitControls.ts";
import { getControls } from "./panel.ts";
import { Renderer } from "./Renderer.ts";

export class Application {
  private readonly camera = new OrbitCamera({
    target: [0, 0.35, 0], yaw: 0.6, pitch: 0.65, distance: 7, minDistance: 4, maxDistance: 14,
  });
  private readonly events = new AbortController();
  private readonly controls: ReturnType<typeof getControls>;
  private readonly unbindResize: () => void;
  private renderer: Renderer;
  private frame = 0;
  private lastTime = 0;
  private phase = 0;
  private playing = true;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext,
    panel: HTMLElement) {
    this.controls = getControls(panel);
    this.renderer = new Renderer(gl);
    const signal = this.events.signal;
    new OrbitControls(canvas, this.camera, this.redraw, signal);
    this.controls.play.addEventListener("click", this.togglePlayback, { signal });
    this.controls.morph.addEventListener("input", this.seek, { signal });
    this.controls.mode.addEventListener("change", this.redraw, { signal });
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, 2);
    this.frame = requestAnimationFrame(this.animate);
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.events.abort();
    this.unbindResize();
    this.renderer.dispose();
  }

  private readonly animate = (time: number): void => {
    const elapsed = this.lastTime === 0 ? 0 : Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;
    if (this.playing) this.phase = (this.phase + elapsed * Math.PI / 5) % (2 * Math.PI);
    this.redraw();
    this.frame = requestAnimationFrame(this.animate);
  };

  private readonly redraw = (): void => {
    const amount = (1 - Math.cos(this.phase)) / 2;
    const [x, height, depth] = this.camera.eye;
    this.renderer.draw([x, -depth, height], amount, this.controls.mode.value === "wireframe");
    this.controls.morph.value = String(amount);
    this.controls.output.value = `${(amount * 100).toFixed(1)}%`;
  };

  private updatePlayback(): void {
    this.controls.play.textContent = this.playing ? "Пауза" : "Продолжить";
    this.controls.play.setAttribute("aria-pressed", String(this.playing));
  }

  private readonly togglePlayback = (): void => {
    this.playing = !this.playing;
    this.updatePlayback();
  };

  private readonly seek = (): void => {
    this.playing = false;
    const amount = Number(this.controls.morph.value);
    this.phase = Math.acos(1 - 2 * amount);
    this.updatePlayback();
    this.redraw();
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frame);
    this.renderer.dispose();
  };

  private readonly contextRestored = (): void => {
    this.renderer = new Renderer(this.gl);
    this.lastTime = 0;
    this.redraw();
    this.frame = requestAnimationFrame(this.animate);
  };
}
