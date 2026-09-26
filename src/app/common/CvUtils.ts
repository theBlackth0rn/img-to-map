import { Contour } from './contour/Contour';

export function findContours(image: CvMat): CvMatVector {
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(image, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  hierarchy.delete();
  return contours;
}

export function convertMatToGrayscale(mat: CvMat): CvMat {
  if (mat.channels() === 1) {
    return mat;
  } else {
    const gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    return gray;
  }
}

export function convertToFloat(image: CvMat): CvMat {
  const floatImage = new cv.Mat();
  if (image.channels() !== 1) {
    const grayImage = convertMatToGrayscale(image);
    grayImage.convertTo(floatImage, cv.CV_32F, 1 / 255);
    grayImage.delete();
  } else {
    image.convertTo(floatImage, cv.CV_32F, 1 / 255);
  }

  return floatImage;
}

export function convertMatToBinary(inputMat: CvMat): CvMat {
  const binaryMat = new cv.Mat();
  cv.threshold(inputMat, binaryMat, 0, 255, cv.THRESH_BINARY);
  return binaryMat;
}

export function convertToCvMatVector(contours: Array<Contour>): CvMatVector {
  const cvMatVector = new cv.MatVector();
  contours.forEach((contour) => {
    cvMatVector.push_back(contour.mat);
  });
  return cvMatVector;
}

export function convertToContourArray(contours: CvMatVector): Array<Contour> {
  const outputContours = [];
  for (let i = 0; i < contours.size(); i++) {
    const contour = new Contour(contours.get(i));
    outputContours.push(contour);
  }
  return outputContours;
}
