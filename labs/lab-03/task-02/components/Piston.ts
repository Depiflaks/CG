import type { CycleState } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import { rectangle } from "@/src/common/graphics/geometry2D.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Piston implements EngineComponent {
  draw(renderer: WebGLRenderer, cycle: CycleState): void {
    const { pistonTop, pistonPin } = cycle;
    renderer.shape(rectangle(278, pistonTop, 164, 89), colors.metalLight);
    renderer.circle(pistonPin, 10, colors.metal);
  }
}
