import type { Player } from "./Player.ts";

const KEYS = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
]);

export class KeyboardControls {
  private readonly pressed = new Set<string>();

  constructor(canvas: HTMLCanvasElement, signal: AbortSignal) {
    canvas.addEventListener("keydown", this.keyDown, { signal });
    window.addEventListener("keyup", this.keyUp, { signal });
    window.addEventListener("blur", this.clear, { signal });
    canvas.addEventListener("blur", this.clear, { signal });
    document.addEventListener("visibilitychange", this.clear, { signal });
    canvas.addEventListener("pointerdown", () => {
      canvas.focus({ preventScroll: true });
    }, { signal });
  }

  update(player: Player, seconds: number): void {
    const forward = this.active("KeyW", "ArrowUp") - this.active("KeyS", "ArrowDown");
    const sideways = this.active("KeyD") - this.active("KeyA");
    const turn = this.active("KeyE", "ArrowRight") - this.active("KeyQ", "ArrowLeft");
    player.update(forward, sideways, turn, seconds);
  }

  clear = (): void => {
    this.pressed.clear();
  };

  private active(...codes: string[]): number {
    return Number(codes.some((code) => this.pressed.has(code)));
  }

  private readonly keyDown = (event: KeyboardEvent): void => {
    if (!KEYS.has(event.code) || event.ctrlKey || event.altKey || event.metaKey) return;
    event.preventDefault();
    this.pressed.add(event.code);
  };

  private readonly keyUp = (event: KeyboardEvent): void => {
    this.pressed.delete(event.code);
  };
}
