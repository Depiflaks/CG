export class Vector2D {
  public constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  public add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  public subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  public scale(factor: number): Vector2D {
    return new Vector2D(this.x * factor, this.y * factor);
  }

  public dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  public magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  public normalize(): Vector2D {
    const length = this.magnitude();

    if (length === 0) {
      return new Vector2D(0, 0);
    }

    return this.scale(1 / length);
  }
}
