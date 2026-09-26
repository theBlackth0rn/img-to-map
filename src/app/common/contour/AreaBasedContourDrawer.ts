import { Colors } from '../Colors';
import { BinaryImage } from '../image/BinaryImage';
import { Contour } from './Contour';
import { convertToContourArray } from '../CvUtils';

export class AreaBasedContourDrawer {
  public readonly contours: Array<Contour>;
  private image: BinaryImage;
  private readonly canvas: HTMLCanvasElement;

  private readonly sortByAreaDesc = (a: Contour, b: Contour) => b.area - a.area;
  private biggestIndexDrawn: number;

  private contoursMatVector: CvMatVector | undefined;

  constructor(canvas: HTMLCanvasElement, image: BinaryImage) {
    this.contours = this.findAndSortContours(image);
    this.canvas = canvas;
    this.image = new BinaryImage(image.width, image.height);
    this.biggestIndexDrawn = -1; // TODO: potential bugs introduced by this starting value
  }

  public drawContoursAbove(area: number): void {
    let biggestIndexToDraw = this.binarySearchForFirstIndexUnder(area);

    this.optimizeDrawingUpTo(biggestIndexToDraw);
    this.image.showOn(this.canvas);
  }

  public delete(): void {
    if (this.contoursMatVector) {
      this.contoursMatVector.delete();
    }
    this.image.delete();
  }

  private findAndSortContours(image: BinaryImage): Array<Contour> {
    this.contoursMatVector = image.findContours();
    let contours = convertToContourArray(this.contoursMatVector);

    return contours.sort(this.sortByAreaDesc);
  }

  private binarySearchForFirstIndexUnder(area: number): number {
    let isUnderArea = (index: number) => this.contours[index].area < area;

    let low = 0;
    let high = this.contours.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      if (isUnderArea(mid) && (mid === 0 || !isUnderArea(mid - 1))) {
        return mid; // Target found
      } else if (!isUnderArea(mid)) {
        low = mid + 1; // Discard the left half
      } else {
        high = mid - 1; // Discard the right half
      }
    }
    return -1; // Target not found
  }

  private optimizeDrawingUpTo(biggestIndexToDraw: number): void {
    let isAddingContours = biggestIndexToDraw > this.biggestIndexDrawn;
    let isFasterToRedrawNecessary =
      biggestIndexToDraw < this.biggestIndexDrawn - biggestIndexToDraw;

    if (isAddingContours) {
      this.drawContoursBetween(this.biggestIndexDrawn + 1, biggestIndexToDraw, Colors.WHITE);
    } else if (isFasterToRedrawNecessary) {
      this.drawContoursBetween(0, biggestIndexToDraw, Colors.WHITE);
    } else {
      this.drawContoursBetween(biggestIndexToDraw, this.biggestIndexDrawn + 1, Colors.BLACK);
    }

    this.biggestIndexDrawn = biggestIndexToDraw - 1;
  }

  // TODO: could still be faster without slice and only iterating between from and to in image.drawContours()
  private drawContoursBetween(from: number, to: number, color: number[] | CvScalar): void {
    this.image.drawContours(
      this.contours.slice(from, to).filter((contour) => !contour.isDeleted),
      color,
    );
  }
}
