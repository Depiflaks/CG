import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { loadImages, type Images } from "./images.ts";
import { Renderer, type Origin } from "./Renderer.ts";

export class Application {
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private readonly pending: Origin[] = [];
  private renderer: Renderer | null = null;
  private images: Images | null = null;
  private origin: Origin = [0.5, 0.5];
  private source = 0;
  private progress = 0;
  private started = 0;
  private frame = 0;
  private playing = false;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext,
    private readonly status: HTMLOutputElement, private readonly play: HTMLButtonElement) {
    const signal = this.events.signal;
    canvas.addEventListener("click", this.click, { signal });
    canvas.addEventListener("keydown", this.keydown, { signal });
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.restore, { signal });
    play.addEventListener("click", () => { this.enqueue([0.5, 0.5]); }, { signal });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, 2);
    void this.initialize();
  }

  dispose(): void {
    this.events.abort();
    cancelAnimationFrame(this.frame);
    this.unbindResize();
    this.renderer?.dispose();
  }

  private async initialize(): Promise<void> {
    try {
      const images = await loadImages();
      if (this.events.signal.aborted) return;
      this.images = images;
      this.restore();
    } catch (error) {
      if (this.events.signal.aborted) return;
      this.status.value = error instanceof Error ? error.message : "Не удалось загрузить изображения.";
    }
  }

  private readonly restore = (): void => {
    if (this.images === null || this.gl.isContextLost()) return;
    try {
      this.renderer = new Renderer(this.gl, this.images);
      this.play.disabled = false;
      this.updateStatus();
      this.redraw();
    } catch (error) {
      this.status.value = error instanceof Error ? error.message : "Ошибка WebGL.";
    }
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frame);
    this.renderer?.dispose();
    this.renderer = null;
    this.playing = false;
    this.progress = 0;
    this.pending.length = 0;
    this.play.disabled = true;
    this.status.value = "Ожидание восстановления WebGL…";
  };

  private readonly click = (event: MouseEvent): void => {
    if (event.button !== 0) return;
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    this.enqueue([(event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top) / bounds.height]);
  };

  private readonly keydown = (event: KeyboardEvent): void => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    this.enqueue([0.5, 0.5]);
  };

  private enqueue(origin: Origin): void {
    if (this.renderer === null) return;
    if (this.playing) {
      this.pending.push(origin);
      return;
    }
    this.origin = origin;
    this.progress = 0;
    this.started = performance.now();
    this.playing = true;
    this.status.value = `Переход ${String(this.source + 1)} → ${String(2 - this.source)}…`;
    this.frame = requestAnimationFrame(this.animate);
  }

  private readonly animate = (time: number): void => {
    this.progress = Math.min((time - this.started) / 2800, 1);
    this.redraw();
    if (this.progress < 1) {
      this.frame = requestAnimationFrame(this.animate);
      return;
    }
    this.source = 1 - this.source;
    this.progress = 0;
    this.playing = false;
    this.updateStatus();
    const next = this.pending.shift();
    if (next !== undefined) this.enqueue(next);
  };

  private readonly redraw = (): void => {
    this.renderer?.draw(this.origin, this.progress, this.source);
  };

  private updateStatus(): void {
    this.status.value = `Изображение ${String(this.source + 1)} · Нажмите на картинку для перехода`;
  }
}
