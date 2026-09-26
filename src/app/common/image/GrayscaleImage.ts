import { convertMatToGrayscale } from '../CvUtils';
import { AbstractImage } from './AbstractImage';
import { BinaryImage } from './BinaryImage';

export class GrayscaleImage extends AbstractImage {
  constructor(width: number, height: number) {
    super(new cv.Mat(height, width, cv.CV_8UC1));
  }

  static fromMat(mat: CvMat): GrayscaleImage {
    const output = new GrayscaleImage(mat.cols, mat.rows);
    output.mat = convertMatToGrayscale(mat);

    return output;
  }

  public applyAdaptiveThreshold(sampleSize: number, increaseThreshold: number): BinaryImage {
    const output = new cv.Mat(this.mat.rows, this.mat.cols, cv.CV_8UC1);
    const constantAddedToEachPixel = -increaseThreshold;

    cv.adaptiveThreshold(
      this.mat,
      output,
      255,
      cv.ADAPTIVE_THRESH_MEAN_C,
      cv.THRESH_BINARY,
      sampleSize,
      constantAddedToEachPixel,
    );

    return BinaryImage.fromBinaryMat(output);
  }

  public toBinaryImage(thresholdValue: number): BinaryImage {
    const binaryOutput = new cv.Mat(this.mat.rows, this.mat.cols, cv.CV_8UC1);
    cv.threshold(this.mat, binaryOutput, thresholdValue, 255, cv.THRESH_BINARY);
    return BinaryImage.fromBinaryMat(binaryOutput);
  }
}
