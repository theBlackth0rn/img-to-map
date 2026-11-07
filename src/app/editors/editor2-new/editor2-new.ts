import { Component, ViewChild } from '@angular/core';
import { BaseEditorComponent } from '../base-editor-component/base-editor-component';
import { Slider } from '../../slider/slider';
import { Contour } from '../../common/contour/Contour';
import { AbstractEditor } from '../AbstractEditor';
import { findContours } from '../../common/CvUtils';
import { BinaryImage } from '../../common/image/BinaryImage';
import { Colors } from '../../common/Colors';
import { ContourSelector } from '../../common/contour/ContourSelector';
import { AreaBasedContourDrawer as ContourDrawer } from '../../common/contour/AreaBasedContourDrawer';
import { ReversibleAction } from '../../common/reversible-action/ReversibleAction';

@Component({
  selector: 'editor2-new',
  imports: [BaseEditorComponent, Slider],
  templateUrl: './editor2-new.html',
  styleUrl: './editor2-new.css',
})
export class Editor2New extends AbstractEditor {
  public minContourArea: number = 1500;

  private contours: Contour[] = [];

  @ViewChild(BaseEditorComponent)
  private baseEditorComponent!: BaseEditorComponent;

  selector!: ContourSelector;
  drawer!: ContourDrawer;
  selectorCanvas!: HTMLCanvasElement;

  override resetPropertiesToDefault(): void {
    this.minContourArea = 1500;
  }

  override onNewInputImage(): void {
    if (this.baseEditorComponent.layeredCanvasFrameRef.nativeElement.childNodes.length < 2) {
      this.selectorCanvas = this.baseEditorComponent.addCanvasLayer();
    }

    this.initializeContourDrawer();
    this.initializeContourSelector();
  }

  override processImage(): void {
    this.drawer.drawContoursAbove(this.minContourArea);
    this.overrideDisplayImageWith(this.drawer.image.getMat().clone());
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.deleteSelection();
    }
    if (event.key === 'Escape') {
      this.selector.clearSelection();
    }
    if (event.key === 'Enter') {
      this.keepSelectionOnly();
    }
  }
  keepSelectionOnly(): ReversibleAction<void> {
    const selection = new Set(this.selector.selection);
    const inverseSelection = new Set(this.contours.filter((contour) => !selection.has(contour)));
    return ReversibleAction.of({
      apply: () => {
        inverseSelection.forEach((contour) => (contour.isDeleted = true));
        this.selector.clearSelection();
        this.drawer.eraseContours(inverseSelection);
      },
      reverse: () => {
        inverseSelection.forEach((contour) => (contour.isDeleted = false));
        this.selector.forceSelection(selection);
        this.drawer.drawContours(inverseSelection);
      },
    });
  }
  deleteSelection(): ReversibleAction<void> {
    const selection = new Set(this.selector.selection);
    return ReversibleAction.of({
      apply: () => {
        selection.forEach((contour) => (contour.isDeleted = true));
        this.selector.clearSelection();
        this.drawer.eraseContours(selection);
      },
      reverse: () => {
        selection.forEach((contour) => (contour.isDeleted = false));
        this.selector.forceSelection(selection);
        this.drawer.drawContours(selection);
      },
    });
  }

  private initializeContourDrawer(): void {
    if (this.drawer) {
      this.drawer.delete();
    }
    this.drawer = new ContourDrawer(
      this.baseEditorComponent.canvasRef.nativeElement,
      BinaryImage.fromBinaryMat(this.getInputImage()),
    );
    this.contours = this.drawer.contours;
  }

  private initializeContourSelector(): void {
    if (this.selector) {
      this.selector.delete();
    }
    this.selector = new ContourSelector(
      this.selectorCanvas,
      this.getInputImage().cols,
      this.getInputImage().rows,
      this.contours,
    );
  }
}
