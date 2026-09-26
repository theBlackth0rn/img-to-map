import { Contour } from '../contour/Contour';

export abstract class AbstractImage {
  protected mat: CvMat;
  public width: number;
  public height: number;

  protected constructor(mat: CvMat) {
    this.mat = mat;
    this.width = mat.cols;
    this.height = mat.rows;
  }

  public drawContours(
    contours: Iterable<Contour>,
    color: number[] | CvScalar,
    thickness: number = cv.FILLED,
  ): void {
    const matVector = new cv.MatVector();
    for (const contour of contours) {
      matVector.push_back(contour.mat);
    }

    let drawAll = -1;
    cv.drawContours(this.mat, matVector, drawAll, color, thickness);

    matVector.delete();
  }

  public delete(): void {
    this.mat.delete();
  }

  public showOn(destination: string | HTMLImageElement | HTMLCanvasElement): void {
    cv.imshow(destination, this.mat);
  }
}
