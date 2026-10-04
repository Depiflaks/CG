import type { CycleState } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class ConnectingRod implements EngineComponent {
  draw(renderer: WebGLRenderer, cycle: CycleState): void {
    const { crankPin, pistonPin } = cycle;
    renderer.line(crankPin, pistonPin, colors.outline, 26);
    renderer.line(crankPin, pistonPin, colors.brass, 22);
    renderer.circle(crankPin, 22, colors.brass);
    renderer.circle(crankPin, 11, colors.metalLight);
  }
}
