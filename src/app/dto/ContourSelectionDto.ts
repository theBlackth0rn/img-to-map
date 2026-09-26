import { Contour } from '../common/contour/Contour';

export class ContourSelectionDto {
  constructor(
    public added: Array<Contour>,
    public removed: Array<Contour>,
  ) {}
}
