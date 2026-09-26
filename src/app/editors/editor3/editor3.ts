import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AbstractEditor } from '../AbstractEditor';
import { Slider } from '../../slider/slider';
import { BaseEditorComponent } from '../base-editor-component/base-editor-component';
import { BinaryImage } from '../../common/image/BinaryImage';
@Component({
  selector: 'editor3',
  imports: [Slider, BaseEditorComponent],
  templateUrl: './editor3.html',
  styleUrl: './editor3.css',
})
export class Editor3 extends AbstractEditor {
  protected coastlineSmoothness: number = 7;

  private inputImageBinary!: BinaryImage;

  @Output()
  override displayImageChanged = new EventEmitter<CvMat>();
  @Output()
  override editorExpanded = new EventEmitter<void>();

  @ViewChild(BaseEditorComponent)
  override baseEditor: BaseEditorComponent = undefined!;

  public override resetPropertiesToDefault(): void {
    this.coastlineSmoothness = 7;
  }

  override processImage() {
    const outputImageBinary = this.smoothenCoastlinesOf(this.inputImageBinary);
    this.overrideDisplayImageWith(outputImageBinary.getMat());
  }

  protected override onNewInputImage(): void {
    this.inputImageBinary = BinaryImage.fromMat(this.getInputImage());
  }

  private smoothenCoastlinesOf(inputImageBinary: BinaryImage): BinaryImage {
    return inputImageBinary.blur(this.coastlineSmoothness).toBinaryImage(200);
  }
}
