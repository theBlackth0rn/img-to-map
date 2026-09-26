export class Colors {
  public static WHITE = rgb(255, 255, 255);
  public static BLACK = rgb(0, 0, 0);
  public static RED = rgb(255, 0, 0);
  public static TRANSPARENT = rgba(0, 0, 0, 0);
}

export function rgb(r: number, g: number, b: number): number[] {
  return [r, g, b, 255];
}

export function rgba(r: number, g: number, b: number, alpha: number): number[] {
  return [r, g, b, alpha];
}
