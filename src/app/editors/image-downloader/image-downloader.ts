import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseEditorComponent } from '../base-editor-component/base-editor-component';
import { AbstractEditor } from '../AbstractEditor';
import { ImageStyleEnum } from './image-styles/ImageStyleEnum';
import { ReversibleAction } from '../../common/reversible-action/ReversibleAction';
import { ImageStyleManager } from './image-styles/ImageStyleManager';
import { ImageStyle } from './image-styles/ImageStyle';
import { findContours, convertToFloat } from '../../common/CvUtils';

@Component({
  selector: 'image-downloader',
  imports: [FormsModule, BaseEditorComponent],
  templateUrl: './image-downloader.html',
  styleUrl: './image-downloader.css',
})
export class ImageDownloader extends AbstractEditor {
  protected imageStyleSelected = ImageStyleEnum.BINARY;
  private styleManager = new ImageStyleManager(this.imageStyleSelected);

  @Output()
  override editorExpanded = new EventEmitter<void>();

  @ViewChild(BaseEditorComponent)
  override baseEditor: BaseEditorComponent = undefined!;
  protected downloadFormat: string = 'image/jpeg';

  public override resetPropertiesToDefault(): void {
    this.imageStyleSelected = ImageStyleEnum.BINARY;
    this.styleManager = new ImageStyleManager(this.imageStyleSelected);
    this.downloadFormat = 'image/jpeg';
  }

  protected override onNewInputImage(): void {
    this.styleManager.setInputImage(this.getInputImage());
  }

  override processImage() {
    this.styleManager.setActive(this.imageStyleSelected);
    this.applyStyleChanges();
  }

  private applyStyleChanges() {
    if (!this.getInputImage()) return;
    this.overrideDisplayImageWith(this.styleManager.apply());
  }
  protected resetRandomSeeds() {
    let oldSeed = ImageStyle.getSeed();
    let newSeed = Math.random();
    ReversibleAction.of<{ old: number; new: number }>({
      dataStorage: { old: oldSeed, new: newSeed },
      apply: (dataStorage: { old: number; new: number }) => {
        this.baseEditor.setIsCanvasLoading(true);
        window.setTimeout(() => {
          this.overrideDisplayImageWith(this.styleManager.setSeedAndGetImage(dataStorage.new));
        }, 0);
      },
      reverse: (dataStorage: { old: number; new: number }) => {
        this.baseEditor.setIsCanvasLoading(true);
        window.setTimeout(() => {
          this.overrideDisplayImageWith(this.styleManager.setSeedAndGetImage(dataStorage.old));
        }, 0);
      },
    });
  }

  protected async downloadImage() {
    const link = document.createElement('a');
    const imgToDownload = new cv.Mat();

    try {
      cv.resize(
        this.getDisplayImage(),
        imgToDownload,
        window.ActiveProject.originalImageSize,
        0,
        0,
        cv.INTER_CUBIC,
      );

      const blob = await this.convertMatToBlob(imgToDownload);

      link.href = URL.createObjectURL(blob);
      link.download = this.getDownloadName();
      link.click();

      URL.revokeObjectURL(link.href);
      link.remove();
    } finally {
      imgToDownload.delete();
    }
  }

  protected loadNoiseMat($event: Event) {
    const img = $event.target as HTMLImageElement;
    const mat = cv.imread(img);
    const floatMat = convertToFloat(mat);

    if (img.id === 'bigger') {
      ImageStyle.setBiggerNoiseMat(floatMat);
    } else if (img.id === 'smaller') {
      ImageStyle.setSmallerNoiseMat(floatMat);
    }
    img.remove();
    mat.delete();
  }

  private convertMatToBlob(mat: CvMat): Promise<Blob> {
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, mat);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        canvas.remove();

        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob.'));
        }
      }, this.downloadFormat);
    });
  }

  private getDownloadName(): string {
    const styleName = this.imageStyleSelected.toLowerCase().replace('_', '-');
    const date = new Date();
    const localDate = date.toLocaleDateString().replace(/[^0-9]/g, '');
    const localTime = date.toLocaleTimeString().replace(/[^0-9]/g, '');
    const extension = this.downloadFormat.split('/')[1];
    return `${styleName}-map-${localDate}-${localTime}.${extension}`;
  }
}
