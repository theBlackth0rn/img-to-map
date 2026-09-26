import { Colors } from '../Colors';
import { AbstractImage } from './AbstractImage';

export class RgbaImage extends AbstractImage {
  public static newTransparent(width: number, height: number): RgbaImage {
    const mat = new cv.Mat(height, width, cv.CV_8UC4, Colors.TRANSPARENT);
    return new RgbaImage(mat);
  }
}
