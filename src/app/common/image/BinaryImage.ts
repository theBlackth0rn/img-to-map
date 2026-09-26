import { Colors } from '../Colors';
import { Contour } from '../contour/Contour';
import { convertMatToBinary } from '../CvUtils';
import { AbstractImage } from './AbstractImage';
import { GrayscaleImage } from './GrayscaleImage';

export class BinaryImage extends GrayscaleImage {
  constructor(width: number, height: number) {
    super(width, height);
  }

  static fromBinaryMat(mat: CvMat): BinaryImage {
    const output = new BinaryImage(mat.cols, mat.rows);
    output.mat = mat;
    return output;
  }

  static override fromMat(output: CvMat): BinaryImage {
    const binaryMat = convertMatToBinary(output);
    return BinaryImage.fromBinaryMat(binaryMat);
  }

  public invert(): void {
    cv.bitwise_not(this.mat, this.mat);
  }

  public blur(ksize: number): GrayscaleImage {
    const blurredOutput = new cv.Mat();
    const anchor = new cv.Point(-1, -1);
    const size = new cv.Size(ksize, ksize);
    cv.blur(this.mat, blurredOutput, size, anchor, cv.BORDER_DEFAULT);
    return GrayscaleImage.fromMat(blurredOutput);
  }

  public dilate(iterations: number): void {
    const anchor = new cv.Point(-1, -1);
    const M = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.dilate(
      this.mat,
      this.mat,
      M,
      anchor,
      iterations,
      cv.BORDER_CONSTANT,
      cv.morphologyDefaultBorderValue(),
    );
  }

  public erode(iterations: number): void {
    const anchor = new cv.Point(-1, -1);
    const M = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.erode(
      this.mat,
      this.mat,
      M,
      anchor,
      iterations,
      cv.BORDER_CONSTANT,
      cv.morphologyDefaultBorderValue(),
    );
  }

  public findContours(): CvMatVector {
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(this.mat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    hierarchy.delete();
    return contours;
  }

  public clear(): void {
    const { rows, cols } = this.mat;
    this.mat.delete();
    this.mat = cv.Mat.zeros(rows, cols, cv.CV_8UC1);
  }

  public getMat(): CvMat {
    return this.mat;
  }
}
