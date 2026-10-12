import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { Maze } from "./Maze.ts";
import { Player } from "./camera/Player.ts";
import { KeyboardControls } from "./camera/KeyboardControls.ts";
import { createGeometry } from "./graphics/geometry.ts";
import { Renderer } from "./graphics/Renderer.ts";
import { loadTextureImages, type TextureImages } from "./graphics/materials.ts";

export class Application {
  private readonly player: Player;
  private readonly controls: KeyboardControls;
  private readonly geometry: Float32Array;
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer | null = null;
  private images: TextureImages | null = null;
  private frame = 0;
  private previousTime = 0;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext, status: HTMLElement) {
    const maze = new Maze();
    this.player = new Player(maze);
    this.geometry = createGeometry(maze);
    const signal = this.events.signal;
    this.controls = new KeyboardControls(canvas, signal);
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, 2);
    void this.loadTextures(status);
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.events.abort();
    this.unbindResize();
    this.renderer?.dispose();
  }

  private async loadTextures(status: HTMLElement): Promise<void> {
    try {
      this.images = await loadTextureImages(this.events.signal);
      if (this.events.signal.aborted) return;
      this.contextRestored();
      status.remove();
    } catch (error) {
      if (this.events.signal.aborted) return;
      status.textContent = error instanceof Error ? error.message : "Не удалось загрузить текстуры.";
    }
  }

  private readonly tick = (time: number): void => {
    const seconds = this.previousTime === 0 ? 0 : Math.min((time - this.previousTime) / 1000, 0.05);
    this.previousTime = time;
    this.controls.update(this.player, seconds);
    this.redraw();
    this.frame = requestAnimationFrame(this.tick);
  };

  private readonly redraw = (): void => {
    this.renderer?.draw(this.player);
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frame);
    this.controls.clear();
    this.previousTime = 0;
  };

  private readonly contextRestored = (): void => {
    if (this.images === null || this.gl.isContextLost()) return;
    cancelAnimationFrame(this.frame);
    this.renderer = new Renderer(this.gl, this.geometry, this.images);
    this.previousTime = 0;
    this.frame = requestAnimationFrame(this.tick);
  };
}
