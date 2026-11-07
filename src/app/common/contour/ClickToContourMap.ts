/*
 * <<licensetext>>
 */

import { convertToCvMatVector } from '../CvUtils';
import { Contour } from './Contour';

export class ClickToContourMap {
  private numberOfContours: number = 0;
  private clickToContourMap: CvMat;
  private readonly contours: Array<Contour>;
  public clickRange: number = 9;
  private readonly MAX_16BIT_UINT_VALUE: number = 65535;

  constructor(contours: Array<Contour>, width: number, height: number) {
    this.contours = contours;
    this.clickToContourMap = new cv.Mat(height, width, cv.CV_16UC1);
    this.initClickToContourMap();
  }

  private initClickToContourMap(): void {
    const contoursMatVector = convertToCvMatVector(this.contours);
    for (let i = 0; i < this.contours.length; i++) {
      cv.drawContours(
        this.clickToContourMap,
        contoursMatVector,
        i,
        new cv.Scalar(i + 1),
        cv.FILLED,
      );
    }
    contoursMatVector.delete();
  }

  public registerContours(contours: Array<Contour>): void {
    const contoursMatVector = convertToCvMatVector(contours);
    for (let i = 0; i < contours.length; i++) {
      let nextContourIndex = this.numberOfContours + i + 1;
      if (nextContourIndex > this.MAX_16BIT_UINT_VALUE) {
        this.numberOfContours = this.MAX_16BIT_UINT_VALUE;
        contoursMatVector.delete();
        throw new Error('Exceeded maximum number of contours for 16-bit ClickToContourMap');
      }
    }
    this.numberOfContours += contours.length;

    contours.forEach((contour, index) => {
      if (this.numberOfContours < this.MAX_16BIT_UINT_VALUE) {
        this.numberOfContours++;
        cv.drawContours(
          this.clickToContourMap,
          contoursMatVector,
          index,
          new cv.Scalar(this.numberOfContours),
          cv.FILLED,
        );
      }
    });

    contoursMatVector.delete();
  }

  public findContourAt(x: number, y: number): Contour | undefined {
    const contourIndex = this.getContourIndexAt(x, y);
    if (contourIndex !== undefined) {
      const contour = this.contours.at(contourIndex);
      return contour;
    }
    const contour = this.findContourInRange(x, y);
    return contour;
  }

  //TODO: rewrite
  public findContourInRange(clickX: number, clickY: number): Contour | undefined {
    const r = this.clickRange;
    const r2 = r * r;
    let closest: { contour_idx: number; sqDist: number } | null = null;

    for (
      let x = Math.max(clickX - r, 0);
      x < Math.min(clickX + r, this.clickToContourMap.cols);
      ++x
    ) {
      for (
        let y = Math.max(clickY - r, 0);
        y < Math.min(clickY + r, this.clickToContourMap.rows);
        ++y
      ) {
        const sqDist = (x - clickX) ** 2 + (y - clickY) ** 2;
        const index = this.getContourIndexAt(x, y);
        if (sqDist <= r2 && index !== undefined && !this.contours.at(index)?.isDeleted) {
          if (!closest || closest.sqDist > sqDist) {
            closest = { contour_idx: index, sqDist: sqDist };
          }
        }
      }
    }
    if (closest) return this.contours.at(closest.contour_idx);
    return undefined;
  }

  private getContourIndexAt(x: number, y: number): number | undefined {
    const index = this.clickToContourMap.ucharPtr(y, x)[0];
    return index > 0 ? index - 1 : undefined;
  }

  public delete(): void {
    this.clickToContourMap.delete();
  }
}
