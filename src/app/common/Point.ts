export class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}

  add(other: Point): void {
    this.x += other.x;
    this.y += other.y;
  }

  subtract(other: Point): void {
    this.x -= other.x;
    this.y -= other.y;
  }

  scale(other: Point): void {
    this.x *= other.x;
    this.y *= other.y;
  }

  roundCoords(): void {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
  }
}