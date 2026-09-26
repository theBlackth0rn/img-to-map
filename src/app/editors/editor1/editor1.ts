import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Slider } from '../../slider/slider';
import { BaseEditorComponent } from '../base-editor-component/base-editor-component';
import { NgTemplateOutlet } from '@angular/common';
import { AbstractEditor } from '../AbstractEditor.js';
import { convertMatToGrayscale } from '../../common/CvUtils';
import { GrayscaleImage } from '../../common/image/GrayscaleImage';

@Component({
  selector: 'editor1',
  imports: [FormsModule, Slider, BaseEditorComponent, NgTemplateOutlet],
  templateUrl: './editor1.html',
  styleUrls: ['./editor1.css'],
})
export class Editor1 extends AbstractEditor {
  protected sampleSize = 501;
  protected shiftThreshold = 0;
  protected dilationIters = 0;
  protected erosionIters = 0;
  protected isDilationFirst: boolean = true;
  protected isResultInverted: boolean = false;
  protected isChangeIgnorable: boolean = false;

  private grayScaleInputImage: CvMat = undefined!;

  private inputImageGrayscale: GrayscaleImage = undefined!;

  @Output()
  override displayImageChanged = new EventEmitter<CvMat>();
  @Output()
  override editorExpanded = new EventEmitter<void>();

  @ViewChild(BaseEditorComponent)
  override baseEditor: BaseEditorComponent = undefined!;

  public override resetPropertiesToDefault(): void {
    this.sampleSize = 501;
    this.shiftThreshold = 0;
    this.dilationIters = 0;
    this.erosionIters = 0;
    this.isDilationFirst = true;
    this.isResultInverted = false;
  }

  override processImage() {
    const outputImageBinary = this.inputImageGrayscale.applyAdaptiveThreshold(
      this.sampleSize,
      this.shiftThreshold,
    );
    if (this.isResultInverted) {
      outputImageBinary.invert();
    }
    if (this.isDilationFirst) {
      outputImageBinary.dilate(this.dilationIters);
      outputImageBinary.erode(this.erosionIters);
    } else {
      outputImageBinary.erode(this.erosionIters);
      outputImageBinary.dilate(this.dilationIters);
    }
    this.overrideDisplayImageWith(outputImageBinary.getMat());
  }

  override onNewInputImage(): void {
    if (this.grayScaleInputImage) {
      this.grayScaleInputImage.delete();
    }
    this.grayScaleInputImage = convertMatToGrayscale(this.getInputImage());
    this.inputImageGrayscale = GrayscaleImage.fromMat(this.getInputImage());
  }

  protected toggleIsDilationFirst(): void {
    this.isChangeIgnorable = this.dilationIters === 0 || this.erosionIters === 0;
    this.setProperty('isDilationFirst', !this.isDilationFirst);
  }
  override handlePropertyChanged(): void {
    if (this.isChangeIgnorable) {
      this.isChangeIgnorable = false;
      return;
    }
    this.scheduleProcessImage();
  }
}
