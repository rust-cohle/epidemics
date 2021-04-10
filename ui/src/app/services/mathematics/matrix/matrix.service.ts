import { Injectable } from '@angular/core';
import { NumberMatrix } from '@epidemics/engine';

@Injectable({
  providedIn: 'root'
})
export class MatrixService {

  constructor() { }

  fromArray(coefficients: number[][]): NumberMatrix {
    return new NumberMatrix(coefficients);
  }
}
