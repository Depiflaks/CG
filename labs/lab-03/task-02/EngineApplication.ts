import { Engine } from "./Engine.ts";
import { WebGLRenderer } from "./graphics/WebGLRenderer.ts";

export class EngineApplication {
  private renderer: WebGLRenderer;
  private readonly engine = new Engine();
  private readonly observer: ResizeObserver;
  private frame = 0;
  private elapsed = 0;
  private previousTime: number | null = null;
  private paused = false;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext) {
    this.renderer = new WebGLRenderer(gl);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(canvas);
    canvas.addEventListener("click", this.toggle);
    canvas.addEventListener("keydown", this.keydown);
    canvas.addEventListener("webglcontextlost", this.contextLost);
    canvas.addEventListener("webglcontextrestored", this.contextRestored);
    window.addEventListener("resize", this.resize);
    this.resize();
    this.frame = requestAnimationFrame(this.tick);
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    window.removeEventListener("resize", this.resize);
    this.canvas.removeEventListener("click", this.toggle);
    this.canvas.removeEventListener("keydown", this.keydown);
    this.canvas.removeEventListener("webglcontextlost", this.contextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.contextRestored);
    this.renderer.dispose();
  }

  private readonly resize = (): void => {
    if (this.gl.isContextLost()) return;
    const bounds = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio, 2);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.renderer.resize(width, height);
    this.engine.draw(this.renderer, this.elapsed / 6000);
  };

  private readonly tick = (timestamp: number): void => {
    if (this.previousTime !== null && !this.paused && !document.hidden) {
      this.elapsed += Math.min(timestamp - this.previousTime, 100);
    }
    this.previousTime = timestamp;
    this.engine.draw(this.renderer, this.elapsed / 6000);
    this.frame = requestAnimationFrame(this.tick);
  };

  private readonly toggle = (): void => {
    this.paused = !this.paused;
  };

  private readonly keydown = (event: KeyboardEvent): void => {
    if (event.code !== "Space" || event.repeat) return;
    event.preventDefault();
    this.toggle();
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frame);
    this.previousTime = null;
  };

  private readonly contextRestored = (): void => {
    this.renderer.dispose();
    this.renderer = new WebGLRenderer(this.gl);
    this.resize();
    this.frame = requestAnimationFrame(this.tick);
  };
}
