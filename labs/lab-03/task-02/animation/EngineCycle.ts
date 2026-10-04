import { Vector2 } from "@/src/common/graphics/vector2.ts";
import { layout } from "../layout.ts";

export type Stroke = "intake" | "compression" | "power" | "exhaust";

export interface CycleState {
  readonly stroke: Stroke;
  readonly progress: number;
  readonly crankAngle: number;
  readonly camAngle: number;
  readonly crankPin: Vector2;
  readonly pistonPin: Vector2;
  readonly pistonTop: number;
  readonly intakeLift: number;
  readonly exhaustLift: number;
  readonly ignition: number;
  readonly combustion: number;
}

export class EngineCycle {
  constructor(private readonly t: number) {}

  sample(): CycleState {
    const phase = ((this.t % 1) + 1) % 1;
    const crankAngle = phase * Math.PI * 4;
    const stroke = this.stroke(phase);
    const progress = phase * 4 % 1;
    const crankPin = this.crankPin(crankAngle);
    const pistonPin = this.pistonPin(crankPin);
    return {
      stroke, progress, crankAngle, camAngle: phase * Math.PI * 2, crankPin, pistonPin,
      pistonTop: pistonPin.y - layout.crownOffset,
      intakeLift: stroke === "intake" ? Math.sin(progress * Math.PI) ** 2 * 18 : 0,
      exhaustLift: stroke === "exhaust" ? Math.sin(progress * Math.PI) ** 2 * 18 : 0,
      ignition: Math.max(0, 1 - Math.abs(phase - 0.505) / 0.018),
      combustion: stroke === "power" ? Math.exp(-progress * 4) : 0,
    };
  }

  private stroke(phase: number): Stroke {
    if (phase < 0.25) return "intake";
    if (phase < 0.5) return "compression";
    if (phase < 0.75) return "power";
    return "exhaust";
  }

  private crankPin(angle: number): Vector2 {
    return layout.crankCenter.add(new Vector2(Math.sin(angle), -Math.cos(angle)).scale(layout.crankRadius));
  }

  private pistonPin(crankPin: Vector2): Vector2 {
    const offset = crankPin.x - layout.crankCenter.x;
    const height = Math.sqrt(layout.rodLength ** 2 - offset ** 2);
    return new Vector2(layout.crankCenter.x, crankPin.y - height);
  }
}
