import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import panzoom, { Transform, PanZoom } from 'panzoom';

@Component({
  selector: 'base-editor-component',
  imports: [],
  templateUrl: './base-editor-component.html',
  styleUrls: ['./base-editor-component.css'],
})
export class BaseEditorComponent {
  protected panzoomInstance!: PanZoom;
  protected isCanvasLoading: boolean = false;

  private static globalPanzoomInstances: PanZoom[] = new Array();
  private static isChangingTransforms: boolean = false;
  private static globalTransform: Transform = { x: 0, y: 0, scale: 1 };

  @ViewChild('editorCanvas')
  public canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('layeredCanvasFrame')
  private layeredCanvasFrameRef!: ElementRef<HTMLDivElement>;
  @ViewChild('collapseToggle')
  private collapseToggleRef!: ElementRef<HTMLAnchorElement>;

  @Input()
  public headingText: string = 'Untitled Editor';
  @Input()
  public editorId: string = 'noIdEditor';

  @Output()
  public displayImageChanged = new EventEmitter<CvMat>();
  @Output()
  public canvasClick = new EventEmitter<PointerEvent>();
  @Output()
  public editorKeydown = new EventEmitter<KeyboardEvent>();
  @Output()
  public editorExpanded = new EventEmitter<void>();

  public isCollapsed: boolean = true;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  public addCanvasLayer(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    this.layeredCanvasFrameRef.nativeElement.appendChild(canvas);
    return canvas;
  }

  public setDisplayImage(image: CvMat) {
    if (!image) return;
    if (!this.panzoomInstance) {
      this.createPanzoomInstance();
    }
    cv.imshow(this.canvasRef.nativeElement, image);
    this.isCanvasLoading = false;
    this.cdr.detectChanges();
  }

  public setIsCollapsed(isCollapsed: boolean): void {
    if (isCollapsed !== this.isCollapsed) {
      this.collapseToggleRef.nativeElement.click();
    }
  }

  public setIsCanvasLoading(isLoading: boolean): void {
    this.isCanvasLoading = isLoading;
    this.cdr.detectChanges();
  }
  public static resetGlobalTransform() {
    BaseEditorComponent.setGlobalPanzoomTransform({ x: 0, y: 0, scale: 1 });
  }
  protected resetGlobalTransform() {
    BaseEditorComponent.resetGlobalTransform();
  }

  @HostListener('window:keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent) {
    if (!this.panzoomInstance) return;
    if (event.key === 'Alt') {
      this.panzoomInstance.resume();
      this.layeredCanvasFrameRef.nativeElement.classList.add('movable');
      this.layeredCanvasFrameRef.nativeElement.classList.remove('clickable');
    } else if (event.key === 'r') {
      this.resetGlobalTransform();
    } else if (this.panzoomInstance.isPaused()) {
      if (this.editorId === 'editor2') {
        this.layeredCanvasFrameRef.nativeElement.classList.add('clickable');
      }
      this.editorKeydown.emit(event);
    }
  }
  @HostListener('window:keyup', ['$event'])
  protected handleKeyup(event: KeyboardEvent) {
    if (!this.panzoomInstance) return;
    if (event.key === 'Alt') {
      this.panzoomInstance.pause();
      this.layeredCanvasFrameRef.nativeElement.classList.remove('movable');
      if (this.editorId === 'editor2') {
        this.layeredCanvasFrameRef.nativeElement.classList.add('clickable');
      }
    }
  }

  protected handleCanvasClick(event: PointerEvent) {
    if (this.panzoomInstance.isPaused()) {
      this.canvasClick.emit(event);
    }
  }

  protected onCollapsePressed() {
    this.isCollapsed = !this.isCollapsed;
    if (!this.isCollapsed) {
      BaseEditorComponent.setGlobalPanzoomTransform(BaseEditorComponent.globalTransform);
      this.editorExpanded.emit();
      this.layeredCanvasFrameRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
  private static setGlobalPanzoomTransform(t: Transform): void {
    if (!BaseEditorComponent.isChangingTransforms) {
      BaseEditorComponent.isChangingTransforms = true;
      BaseEditorComponent.globalTransform = t;
      BaseEditorComponent.globalPanzoomInstances.forEach((p) => {
        p.zoomAbs(0, 0, t.scale);
        p.moveTo(t.x, t.y);
      });
      BaseEditorComponent.isChangingTransforms = false;
    }
  }

  private createPanzoomInstance() {
    const panzoomOptions = {
      maxZoom: 2,
      minZoom: 0.8,
      bounds: true,
    };
    this.panzoomInstance = panzoom(this.layeredCanvasFrameRef.nativeElement, panzoomOptions);
    this.panzoomInstance.pause();
    this.panzoomInstance.zoomAbs(0, 0, BaseEditorComponent.globalTransform.scale);
    this.panzoomInstance.moveTo(
      BaseEditorComponent.globalTransform.x,
      BaseEditorComponent.globalTransform.y,
    );
    this.panzoomInstance.on('pan', (p: PanZoom) => {
      BaseEditorComponent.setGlobalPanzoomTransform(p.getTransform());
    });
    this.panzoomInstance.on('zoom', (p: PanZoom) => {
      BaseEditorComponent.setGlobalPanzoomTransform(p.getTransform());
    });

    BaseEditorComponent.globalPanzoomInstances.push(this.panzoomInstance);
  }
}
