import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class ConnectingRod implements EngineComponent {
  draw(renderer: WebGLRenderer, t: number): void {
    const { crankPin, pistonPin } = new EngineCycle(t).sample();
    renderer.line(crankPin, pistonPin, colors.outline, 26);
    renderer.line(crankPin, pistonPin, colors.brass, 22);
    renderer.circle(crankPin, 22, colors.brass);
    renderer.circle(crankPin, 11, colors.metalLight);
  }
}
