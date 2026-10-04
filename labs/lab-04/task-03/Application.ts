import { bindCanvasResize } from "@/src/common/canvas/index.ts";
import { Maze } from "./Maze.ts";
import { Player } from "./camera/Player.ts";
import { KeyboardControls } from "./camera/KeyboardControls.ts";
import { createGeometry } from "./graphics/geometry.ts";
import { Renderer } from "./graphics/Renderer.ts";

export class Application {
  private readonly player: Player;
  private readonly controls: KeyboardControls;
  private readonly geometry: Float32Array;
  private readonly events = new AbortController();
  private readonly unbindResize: () => void;
  private renderer: Renderer;
  private frame = 0;
  private previousTime = 0;

  constructor(canvas: HTMLCanvasElement, private readonly gl: WebGL2RenderingContext) {
    const maze = new Maze();
    this.player = new Player(maze);
    this.geometry = createGeometry(maze);
    this.renderer = new Renderer(gl, this.geometry);
    const signal = this.events.signal;
    this.controls = new KeyboardControls(canvas, signal);
    canvas.addEventListener("webglcontextlost", this.contextLost, { signal });
    canvas.addEventListener("webglcontextrestored", this.contextRestored, { signal });
    this.unbindResize = bindCanvasResize(canvas, this.redraw, 2);
    this.frame = requestAnimationFrame(this.tick);
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.events.abort();
    this.unbindResize();
    this.renderer.dispose();
  }

  private readonly tick = (time: number): void => {
    const seconds = this.previousTime === 0 ? 0 : Math.min((time - this.previousTime) / 1000, 0.05);
    this.previousTime = time;
    this.controls.update(this.player, seconds);
    this.redraw();
    this.frame = requestAnimationFrame(this.tick);
  };

  private readonly redraw = (): void => {
    this.renderer.draw(this.player);
  };

  private readonly contextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frame);
    this.controls.clear();
    this.previousTime = 0;
  };

  private readonly contextRestored = (): void => {
    this.renderer = new Renderer(this.gl, this.geometry);
    this.previousTime = 0;
    this.frame = requestAnimationFrame(this.tick);
  };
}
