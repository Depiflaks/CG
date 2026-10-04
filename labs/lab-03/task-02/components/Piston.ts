import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import { rectangle } from "@/src/common/graphics/geometry2D.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Piston implements EngineComponent {
  draw(renderer: WebGLRenderer, t: number): void {
    const { pistonTop, pistonPin } = new EngineCycle(t).sample();
    renderer.shape(rectangle(278, pistonTop, 164, 89), colors.metalLight);
    renderer.circle(pistonPin, 10, colors.metal);
  }
}
