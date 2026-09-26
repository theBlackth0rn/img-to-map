export class Contour {
  public readonly mat: CvMat;
  public readonly area: number;
  public isDeleted: boolean = false;

  constructor(mat: CvMat) {
    this.mat = mat;
    this.area = cv.contourArea(this.mat);
  }
}
