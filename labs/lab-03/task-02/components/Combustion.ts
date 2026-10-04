import type { CycleState } from "../animation/EngineCycle.ts";
import { Vector2 } from "@/src/common/graphics/vector2.ts";
import { colors } from "../graphics/colors.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { layout } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Combustion implements EngineComponent {
  draw(renderer: WebGLRenderer, cycle: CycleState): void {
    if (cycle.combustion < 0.4) return;
    renderer.fill([...layout.roof, new Vector2(444, cycle.pistonTop),
      new Vector2(276, cycle.pistonTop)], colors.fire);
  }
}
