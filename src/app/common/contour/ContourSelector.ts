import { Colors } from '../Colors';
import { RgbaImage } from '../image/RgbaImage';
import { Point } from '../Point';
import { ClickToContourMap } from './ClickToContourMap';
import { Contour } from './Contour';

export class ContourSelector {
  private canvas: HTMLCanvasElement;
  private readonly contours: Array<Contour>;
  private clickToContourMap: ClickToContourMap; // Replace 'any' with the actual type of clickToContourMap
  public selection: Set<Contour>;
  private selectionImage: RgbaImage;


  constructor(canvas: HTMLCanvasElement, width: number, height: number, contours: Array<Contour>) {
    this.canvas = canvas;
    this.contours = contours;
    this.selection = new Set<Contour>();
    this.selectionImage = RgbaImage.newTransparent(width, height);
    this.clickToContourMap = new ClickToContourMap(contours, width, height);

  }

  public handleCanvasClick(event: PointerEvent) {
    const click = this.getClickRelativeToCanvas(event);
    const clickedContour = this.clickToContourMap.findContourAt(click.x, click.y);

    if (clickedContour !== undefined && !clickedContour.isDeleted) {
      const isCtrlHeld = event.ctrlKey || event.metaKey || event.shiftKey;

      this.updateSelectionWith(clickedContour, isCtrlHeld);
    }
  }

  public dropSelection(): void {
    this.selectionImage.drawContours(this.selection, Colors.TRANSPARENT);
    this.selection.clear();
  } 

  public forceSelection(newSelection: Set<Contour>): void {
    this.dropSelection();
    this.select(newSelection);
  }

  public delete(): void {
    this.clickToContourMap.delete();
  }

  private getClickRelativeToCanvas(event: PointerEvent): Point {
    const canvasBounds = this.canvas.getBoundingClientRect();
    const click = new Point(event.clientX, event.clientY);
    const canvasPosition = new Point(canvasBounds.left, canvasBounds.top);
    const imageToCanvasRatio = new Point(
      this.selectionImage.width / canvasBounds.width,
      this.selectionImage.height / canvasBounds.height,
    );

    click.subtract(canvasPosition);
    click.scale(imageToCanvasRatio);
    click.roundCoords();

    return click;
  }
  
  private updateSelectionWith(clickedContour: Contour, isKeepSelection: boolean) {
    if (!isKeepSelection) {
         this.dropSelection();
    }    
    if (this.selection.has(clickedContour)) {
        this.unselect([clickedContour]);
    } else {
        this.select([clickedContour]);
    }
  }

  private select(contours: Set<Contour> | Array<Contour>): void {
    contours.forEach(contour => this.selection.add(contour));
    this.selectionImage.drawContours(contours, Colors.RED);
  }

  private unselect(contours: Set<Contour> | Array<Contour>): void {
    contours.forEach(contour => this.selection.delete(contour));
    this.selectionImage.drawContours(contours, Colors.TRANSPARENT);
  }


}
