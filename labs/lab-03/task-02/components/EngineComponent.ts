import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";

export interface EngineComponent {
  draw(renderer: WebGLRenderer, t: number): void;
}
