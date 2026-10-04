export class Vector2 {
  public constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  public add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  public subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  public scale(factor: number): Vector2 {
    return new Vector2(this.x * factor, this.y * factor);
  }

  public dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  public magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  public normalize(): Vector2 {
    const length = this.magnitude();

    if (length === 0) {
      return new Vector2(0, 0);
    }

    return this.scale(1 / length);
  }
}
