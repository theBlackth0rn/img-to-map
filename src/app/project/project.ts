import { Component, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploader } from '../image-uploader/image-uploader';
import { ImageDownloader } from '../editors/image-downloader/image-downloader.js';
import { Editor1 } from '../editors/editor1/editor1.js';
import { Editor3 } from '../editors/editor3/editor3.js';
import { Editor2 } from '../editors/editor2/editor2.js';
import { AbstractEditor } from '../editors/AbstractEditor.js';
import { ReversibleAction } from '../common/reversible-action/ReversibleAction';
import { BaseEditorComponent } from '../editors/base-editor-component/base-editor-component';
import { UploadedImageDto } from '../dto/UploadedImageDto';
import { Editor2New } from '../editors/editor2-new/editor2-new';

@Component({
  selector: 'project',
  imports: [CommonModule, ImageUploader, Editor1, Editor2, Editor3, ImageDownloader, Editor2New],
  templateUrl: './project.html',
  styleUrls: ['./project.css'],
})
export class Project {
  private actionHistory: ReversibleAction<unknown>[] = [];
  private undoneActions: ReversibleAction<unknown>[] = [];
  public originalImageSize: CvSize | undefined = undefined;
  protected displayEditors = false;

  @ViewChild(ImageUploader) imageUploader!: ImageUploader;
  @ViewChild(Editor1) editor1!: Editor1;
  @ViewChild(Editor2) editor2!: Editor2;
  @ViewChild(Editor2New) editor2New!: Editor2New;
  @ViewChild(Editor3) editor3!: Editor3;
  @ViewChild(ImageDownloader) imageDownloader!: ImageDownloader;

  constructor() {
    window.ActiveProject = this;
  }

  public undo(): void {
    const action = this.actionHistory.pop();
    if (action) {
      action.reverse();
      this.undoneActions.push(action);
    }
  }

  public redo(): void {
    const action = this.undoneActions.pop();
    if (action) {
      action.apply();
      this.actionHistory.push(action);
    }
  }

  public registerAction(action: ReversibleAction<unknown>): void {
    this.actionHistory.push(action);
    this.undoneActions = [];
  }

  @HostListener('window:keydown', ['$event'])
  protected keyboardEventHandler(event: KeyboardEvent) {
    if (event.ctrlKey) {
      if (event.key === 'y') {
        event.preventDefault();
        this.redo();
      }
      if (event.key === 'z') {
        event.preventDefault();
        this.undo();
      }
    }
  }

  protected onImageLoadingStarted(): void {
    this.displayEditors = false;
  }

  protected onSuccessfulUpload(uploadDto: UploadedImageDto): void {
    if (!uploadDto.isValid()) {
      return;
    }
    this.resetProjectState(uploadDto);
  }

  protected propagateImageChangeFrom(editorIndex: number): void {
    if (this.isAnyEditorExpandedAfter(editorIndex)) {
      const currentEditor = this.getEditors()[editorIndex];
      const nextEditor = this.getEditors()[editorIndex + 1];
      console.log('current editor:', currentEditor);
      console.log('next editor:', nextEditor);
      console.log('current editor display image:', currentEditor.getDisplayImage());
      nextEditor.setInputImage(currentEditor.getDisplayImage().clone());
    }
  }

  protected onEditorExpanded(expandedEditorIndex: number): void {
    if (!this.isAnyEditorExpandedAfter(expandedEditorIndex)) {
      const lastExpandedEditorIndex = this.getEditors().findLastIndex(
        (editor, index) => index < expandedEditorIndex && !editor.isCollapsed(),
      );
      if (lastExpandedEditorIndex !== -1) {
        this.propagateImageChangeFrom(lastExpandedEditorIndex);
      } else {
        this.propagateImageChangeFrom(0);
      }
    }
  }

  private resetProjectState(uploadDto: UploadedImageDto) {
    this.actionHistory = [];
    this.undoneActions = [];
    BaseEditorComponent.resetGlobalTransform();
    this.displayEditors = true;

    this.editor1.setInputImage(uploadDto.image);
    this.originalImageSize = uploadDto.originalSize;

    this.getEditors().forEach((editor, index) => {
      editor.setIsCollapsed(index > 0);
      editor.resetPropertiesToDefault();
    });
  }

  private isAnyEditorExpandedAfter(editorIndex: number): boolean {
    return this.getEditors().some((editor, index) => index > editorIndex && !editor.isCollapsed());
  }

  private getEditors(): AbstractEditor[] {
    return [this.editor1, this.editor2New, this.editor3, this.imageDownloader];
  }
}
