import { colors } from "../graphics/colors.ts";
import { rectangle } from "@/src/common/graphics/geometry2D.ts";
import { Vector2 } from "@/src/common/graphics/vector2.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { layout } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class EngineBlock implements EngineComponent {
  draw(renderer: WebGLRenderer): void {
    this.drawCrankcase(renderer);
    this.drawCylinder(renderer);
    this.drawPorts(renderer);
  }

  private drawCrankcase(renderer: WebGLRenderer): void {
    renderer.shape(rectangle(220, 570, 280, 260), colors.metal);
    renderer.shape(rectangle(240, 590, 240, 220), colors.cavity);
    renderer.fill(rectangle(276, 565, 168, 40), colors.cavity);
  }

  private drawCylinder(renderer: WebGLRenderer): void {
    renderer.shape([new Vector2(239, 266), new Vector2(303, 246), new Vector2(417, 246),
      new Vector2(481, 266), new Vector2(481, 337), new Vector2(239, 337)], colors.metal);
    renderer.shape([...layout.roof, new Vector2(444, 576), new Vector2(276, 576)], colors.chamber);
    renderer.shape(rectangle(239, 337, 37, 247), colors.metal);
    renderer.shape(rectangle(444, 337, 37, 247), colors.metal);
  }

  private drawPorts(renderer: WebGLRenderer): void {
    const outer = [new Vector2(141, 220), new Vector2(220, 220), new Vector2(318, 278),
      new Vector2(287, 310), new Vector2(209, 263), new Vector2(141, 263)];
    const inner = [new Vector2(141, 231), new Vector2(216, 231), new Vector2(306, 283),
      new Vector2(289, 298), new Vector2(212, 252), new Vector2(141, 252)];
    renderer.shape(outer, colors.metal);
    renderer.fill(inner, colors.chamber);
    renderer.shape(this.mirror(outer), colors.metal);
    renderer.fill(this.mirror(inner), colors.chamber);
  }

  private mirror(points: readonly Vector2[]): Vector2[] {
    return points.map(({ x, y }): Vector2 => new Vector2(720 - x, y));
  }
}
