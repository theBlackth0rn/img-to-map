interface CvMat {
  readonly rows: number;
  readonly cols: number;
  readonly data16U: Uint16Array;
  ucharPtr(row: number, column: number): Uint8Array;
  floatPtr(row: number, column: number): Float32Array;
  clone(): CvMat;
  roi(rectangle: object): CvMat;
  setTo(value: CvScalar | number[], mask?: CvMat): void;
  convertTo(destination: CvMat, type: number, alpha?: number): void;
  size(): CvSize;
  channels(): number;
  copyTo(dst: CvMat): void;
  delete(): void;
}

interface CvMatConstructor {
  new (): CvMat;
  new (rows: number, cols: number, type: number, scalar?: CvScalar | number[]): CvMat;
  zeros(rows: number, cols: number, type: number): CvMat;
  ones(rows: number, cols: number, type: number): CvMat;
}

interface CvMatVector {
  push_back(mat: CvMat): unknown;
  new (): CvMatVector;
  size(): number;
  get(index: number): CvMat;
  delete(): void;
}

interface CvSize {
  width: number;
  height: number;
}

interface CvSizeConstructor {
  new (width?: number, height?: number): CvSize;
}

interface CvPointConstructor {
  new (x: number, y: number): object;
}

interface CvScalar {
  delete(): void;
}

interface CvScalarConstructor {
  new (...values: number[]): CvScalar;
}

interface CvRectConstructor {
  new (x: number, y: number, width: number, height: number): object;
}

interface CvNamespace {
  readonly Mat: CvMatConstructor;
  readonly MatVector: CvMatVector;
  readonly Size: CvSizeConstructor;
  readonly Point: CvPointConstructor;
  readonly Scalar: CvScalarConstructor;
  readonly Rect: CvRectConstructor;

  readonly CV_8U: number;
  readonly CV_8UC1: number;
  readonly CV_8UC3: number;
  readonly CV_8UC4: number;
  readonly CV_8SC2: number;
  readonly CV_16UC1: number;
  readonly CV_32F: number;
  readonly CV_32FC1: number;
  readonly COLOR_RGBA2GRAY: number;
  readonly RETR_EXTERNAL: number;
  readonly CHAIN_APPROX_SIMPLE: number;
  readonly ADAPTIVE_THRESH_MEAN_C: number;
  readonly THRESH_BINARY: number;
  readonly THRESH_BINARY_INV: number;
  readonly BORDER_DEFAULT: number;
  readonly BORDER_CONSTANT: number;
  readonly INTER_AREA: number;
  readonly INTER_CUBIC: number;
  readonly FILLED: number;
  readonly LINE_4: number;

  imread(source: string | HTMLImageElement | HTMLCanvasElement): CvMat;
  imshow(destination: string | HTMLImageElement | HTMLCanvasElement, image: CvMat): void;
  resize(
    source: CvMat,
    destination: CvMat,
    size: CvSize,
    fx: number,
    fy: number,
    interpolation: number,
  ): void;
  cvtColor(source: CvMat, destination: CvMat, code: number): void;
  threshold(
    source: CvMat,
    destination: CvMat,
    threshold: number,
    maxValue: number,
    type: number,
  ): void;
  blur(source: CvMat, destination: CvMat, size: CvSize, anchor?: object, borderType?: number): void;
  bitwise_not(mat: CvMat, mat1: CvMat): unknown;
  adaptiveThreshold(...args: unknown[]): void;
  dilate(...args: unknown[]): void;
  erode(...args: unknown[]): void;
  findContours(...args: unknown[]): void;
  drawContours(...args: unknown[]): void;
  addWeighted(...args: unknown[]): void;
  inRange(...args: unknown[]): void;
  contourArea(contour: CvMat): number;
  morphologyDefaultBorderValue(): object;
}
