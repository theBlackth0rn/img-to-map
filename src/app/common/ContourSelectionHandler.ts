import { ContoursSortedByArea } from './contour/ContoursSortedByArea';
import { ClickToContourMap } from './contour/ClickToContourMap';
import { EventEmitter } from '@angular/core';
import { Contour } from './contour/Contour';
import { Point } from './Point';
import { ContourSelectionDto } from '../dto/ContourSelectionDto';
import { convertToCvMatVector } from './CvUtils';

export class ContourSelectionHandler {
  clickToContourMap: ClickToContourMap;
  private readonly contours: ContoursSortedByArea;
  public selection: Set<Contour> = new Set();
  private width: number;
  private height: number;
  private readonly canvas: HTMLCanvasElement;
  private selectionDisplay: CvMat;

  public selectionChanged = new EventEmitter<ContourSelectionDto>();

  constructor(
    canvas: HTMLCanvasElement,
    contours: ContoursSortedByArea,
    width: number,
    height: number,
  ) {
    this.canvas = canvas;
    this.contours = contours;
    this.width = width;
    this.height = height;
    this.clickToContourMap = new ClickToContourMap(contours, width, height);
    this.selectionDisplay = cv.Mat.zeros(height, width, cv.CV_8UC4);
  }

  public handleCanvasClick(event: PointerEvent) {
    const click = this.getClickRelativeToCanvas(event);
    const clickedContour = this.clickToContourMap.findContourAt(click.x, click.y);

    if (clickedContour !== undefined && !clickedContour.isDeleted) {
      const isCtrlHeld = event.ctrlKey || event.metaKey || event.shiftKey;

      const dto = this.buildSelectionDto(clickedContour, isCtrlHeld);

      this.performSelection(dto);
    }
  }

  public dropSelection(): void {
    const dropSelectionDto = {
      added: [],
      removed: Array.from(this.selection),
    };
    this.performSelection(dropSelectionDto);
  }

  forceSelection(newSelection: Set<Contour>) {
    const forceSelectionDto = {
      added: Array.from(newSelection),
      removed: Array.from(this.selection),
    };
    this.performSelection(forceSelectionDto);
  }

  // TODO: passing on the selection of deleted/under minArea contours will introduce bugs
  private buildSelectionDto(contour: Contour, isKeepSelection: boolean): ContourSelectionDto {
    const added: Array<Contour> = [];
    const removed: Array<Contour> = [];

    if (!isKeepSelection) {
      removed.push(...this.selection);
    }

    if (!this.selection.has(contour)) {
      added.push(contour);
    } else if (isKeepSelection) {
      removed.push(contour);
    }

    return { added, removed };
  }

  public performSelection(dto: ContourSelectionDto): void {
    dto.removed.forEach((contour) => this.selection.delete(contour));
    dto.added.forEach((contour) => this.selection.add(contour));

    this.drawContours(dto.removed, [0, 0, 0, 0]);
    this.drawContours(dto.added, [255, 0, 0, 255]);

    this.selectionChanged.emit(dto);
  }

  public revertSelection(dto: ContourSelectionDto): void {
    const reversedDto = {
      added: dto.removed,
      removed: dto.added,
    };
    this.performSelection(reversedDto);
  }

  private drawContours(contours: Iterable<Contour>, color: CvScalar | number[]): void {
    const matVector = convertToCvMatVector(Array.from(contours));
    cv.drawContours(this.selectionDisplay, matVector, -1, color, cv.FILLED);
    matVector.delete();
  }

  private getClickRelativeToCanvas(event: PointerEvent): Point {
    const canvasBounds = this.canvas.getBoundingClientRect();
    const click = new Point(event.clientX, event.clientY);
    const canvasPosition = new Point(canvasBounds.left, canvasBounds.top);
    const imageToCanvasRatio = new Point(
      this.width / canvasBounds.width,
      this.height / canvasBounds.height,
    );

    click.subtract(canvasPosition);
    click.scale(imageToCanvasRatio);
    click.roundCoords();

    return click;
  }

  public delete(): void {
    this.clickToContourMap.delete();
  }
}
