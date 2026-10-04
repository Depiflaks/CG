import type { CycleState } from "../animation/EngineCycle.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";

export interface EngineComponent {
  draw(renderer: WebGLRenderer, cycle: CycleState): void;
}
