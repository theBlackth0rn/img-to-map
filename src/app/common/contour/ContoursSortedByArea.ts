import { Colors } from '../Colors';
import { Contour } from './Contour';

export class ContoursSortedByArea {
  public contourArraySorted = new Array<Contour>();
  private readonly sortByAreaDescending = (a: Contour, b: Contour) => b.area - a.area;

  constructor(cvContours: CvMatVector) {
    for (let i = 0; i < cvContours.size(); i++) {
      const contour = new Contour(cvContours.get(i));
      this.contourArraySorted.push(contour);
    }
    this.contourArraySorted.sort(this.sortByAreaDescending);
  }

  public get(index: number): Contour | undefined {
    return this.contourArraySorted.at(index);
  }

  public drawAboveArea(minArea: number, image: CvMat): void {
    let i = 0;
    let contour = this.contourArraySorted.at(i);

    const matVector = new cv.MatVector();
    while (contour !== undefined && contour.area >= minArea) {
      matVector.push_back(contour.mat);
      i++;
      contour = this.contourArraySorted.at(i);
    }
    cv.drawContours(image, matVector, -1, Colors.WHITE, cv.FILLED);
    matVector.delete();
  }

  public findContoursAboveArea(minArea: number): CvMatVector {
    const matVector = new cv.MatVector();
    for (const contour of this.contourArraySorted) {
      if (contour.area >= minArea) {
        matVector.push_back(contour.mat);
      } else {
        break;
      }
    }
    return matVector;
  }

  public findBetweenAreas(area1: number, area2: number): CvMatVector {
    const minArea = Math.min(area1, area2);
    const maxArea = Math.max(area1, area2);

    const matVector = new cv.MatVector();
    for (const contour of this.contourArraySorted) {
      if (contour.area >= minArea && contour.area <= maxArea) {
        matVector.push_back(contour.mat);
      } else if (contour.area < minArea) {
        break;
      }
    }
    return matVector;
  }
}
