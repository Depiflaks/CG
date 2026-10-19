import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { loadImages, type Images } from "./images.ts";
import { Renderer, type Origin } from "./Renderer.ts";

export class Application {
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer | null = null;
  private images: Images | null = null;
  private origin: Origin = [0, 0];
  private source = 0;
  private progress = 0;
  private started = 0;
  private frame = 0;
  private playing = false;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext) {
    const signal = this.events.signal;
    canvas.addEventListener("click", this.click, { signal });
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.restore, { signal });
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
      console.error(error);
    }
  }

  private readonly restore = (): void => {
    if (this.images === null || this.gl.isContextLost()) return;
    try {
      this.renderer = new Renderer(this.gl, this.images);
      this.redraw();
    } catch (error) {
      console.error(error);
    }
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frame);
    this.renderer?.dispose();
    this.renderer = null;
    this.playing = false;
    this.progress = 0;
  };

  private readonly click = (event: MouseEvent): void => {
    if (event.button !== 0 || this.playing) return;
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    this.start([(event.clientX - bounds.left) / bounds.width * 2 - 1,
      1 - (event.clientY - bounds.top) / bounds.height * 2]);
  };

  private start(origin: Origin): void {
    if (this.renderer === null || this.playing) return;
    this.origin = origin;
    this.progress = 0;
    this.started = performance.now();
    this.playing = true;
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
  };

  private readonly redraw = (): void => {
    this.renderer?.draw(this.origin, this.progress, this.source);
  };
}
