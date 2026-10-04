import type { CycleState } from "../animation/EngineCycle.ts";
import { Vector2 } from "@/src/common/graphics/vector2.ts";
import { colors } from "../graphics/colors.ts";
import { rectangle } from "@/src/common/graphics/geometry2D.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class SparkPlug implements EngineComponent {
  draw(renderer: WebGLRenderer, cycle: CycleState): void {
    renderer.shape(rectangle(355, 166, 10, 24), colors.metal);
    renderer.shape(rectangle(349, 190, 22, 43), colors.white);
    renderer.shape(rectangle(347, 233, 26, 39), colors.metal);
    renderer.line(new Vector2(360, 272), new Vector2(360, 284), colors.outline, 3);
    renderer.polyline([new Vector2(371, 269), new Vector2(371, 289), new Vector2(363, 289)], colors.outline, 3);
    if (cycle.ignition > 0) {
      renderer.polyline([new Vector2(360, 282), new Vector2(363, 284),
        new Vector2(359, 286), new Vector2(364, 289)], colors.spark, 3);
    }
  }
}
