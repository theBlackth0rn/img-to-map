import { Component, ViewChild } from '@angular/core';
import { BaseEditorComponent } from '../base-editor-component/base-editor-component';
import { Slider } from '../../slider/slider';
import { Contour } from '../../common/contour/Contour';
import { AbstractEditor } from '../AbstractEditor';
import { findContours } from '../../common/CvUtils';
import { BinaryImage } from '../../common/image/BinaryImage';
import { Colors } from '../../common/Colors';

@Component({
  selector: 'app-editor2-new',
  imports: [BaseEditorComponent, Slider],
  templateUrl: './editor2-new.html',
  styleUrl: './editor2-new.css',
})
export class Editor2New extends AbstractEditor {
  public minContourArea: number = 1500;
  private biggestIndexDrawn: number = -1;

  private contours: Contour[] = [];
  private sortByAreaDecreasing = (a: Contour, b: Contour) => b.area - a.area;
  private contourImage!: BinaryImage;

  @ViewChild(BaseEditorComponent)
  private baseEditorComponent!: BaseEditorComponent;

  public override resetPropertiesToDefault(): void {
    this.minContourArea = 1500;
  }

  // only runs on new input images
  protected override processImage(): void {
    this.findAndSortContours();
    this.drawContoursAboveMinArea();

    this.overrideDisplayImageWith(this.contourImage.getMat());
  }

  protected override handlePropertyChanged(): void {
    let biggestIndexToDraw = this.binarySearchForFirstIndexUnder(this.minContourArea);

    if (biggestIndexToDraw > this.biggestIndexDrawn) {
      this.drawContoursBetween(this.biggestIndexDrawn + 1, biggestIndexToDraw, Colors.WHITE);
    } else {
      let isFasterToRedrawAll = biggestIndexToDraw < this.biggestIndexDrawn - biggestIndexToDraw;
      if (isFasterToRedrawAll) {
        this.drawContoursAboveMinArea();
      } else {
        this.drawContoursBetween(biggestIndexToDraw, this.biggestIndexDrawn + 1, Colors.BLACK);
      }
    }
    this.biggestIndexDrawn = biggestIndexToDraw - 1;
    this.overrideDisplayImageWith(this.contourImage.getMat());
  }

  private findAndSortContours(): void {
    const contoursMatVector = findContours(this.getInputImage());
    this.contours = this.createContourArrayFrom(contoursMatVector);
    this.contours.sort(this.sortByAreaDecreasing);
  }

  private drawContoursAboveMinArea(): void {
    let lastIndex = this.binarySearchForFirstIndexUnder(this.minContourArea);
    let contoursAbove = this.contours.slice(0, lastIndex);

    this.contourImage.drawContours(contoursAbove, Colors.WHITE);
    this.biggestIndexDrawn = lastIndex - 1;
  }

  private createContourArrayFrom(contours: CvMatVector): Array<Contour> {
    let outputContours = [];
    for (let i = 0; i < contours.size(); i++) {
      const contour = new Contour(contours.get(i));
      if (contour.area >= this.minContourArea) {
        outputContours.push(contour);
      }
    }
    return outputContours;
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

  private drawContoursBetween(
    startIndex: number,
    endIndex: number,
    color: number[] | CvScalar,
  ): void {
    this.contourImage.drawContours(
      this.contours.slice(startIndex, endIndex).filter((contour) => !contour.isDeleted),
      color,
    );
  }
}
