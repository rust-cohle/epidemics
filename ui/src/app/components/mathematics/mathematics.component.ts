import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DeterminantNumber, NumberMatrix, TexMatrix, get2DRotationMatrix, NumberVector2D } from '@epidemics/engine';

@Component({
  selector: 'app-mathematics',
  templateUrl: './mathematics.component.html',
  styleUrls: ['./mathematics.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MathematicsComponent implements OnInit {
  matrix1: string | undefined;
  matrix2: string | undefined;
  matrix3: string | undefined;
  matrix4: string | undefined;
  matrix5: string | undefined;
  determinantEquality: string | undefined;
  
  rotation2DMatrix: string | undefined;
  rotation3DMatrix: string | undefined;
  rotation2DEquality: string | undefined;

  rotatedVector: NumberVector2D;

  line1_system1: string = `(L_1): \\begin{cases}
  \\mathbf{n} = (a_1,b_1) {\\scriptstyle \\;direction\\:vector}\\\\
  P_1 \\in (L_1), \\;P_1 = (x_1,y_1) 
  \\end{cases}`;
  line2_system1: string = `(L_2): \\begin{cases}
  \\mathbf{n} = (a_2,b_2) {\\scriptstyle \\;direction\\:vector}\\\\
  P_2 \\in (L_2), \\;P_2 = (x_2,y_2) 
  \\end{cases}`;

  line1_system2: string = `\\forall t \\in \\mathbb{R}, \\begin{cases}
  x = a_1 t + x_1\\\\
  y = b_1 t + y_1 
  \\end{cases}`;
  line2_system2: string = `\\forall t \\in \\mathbb{R}, \\begin{cases}
  x = a_2 t + x_2\\\\
  y = b_2 t + y_2 
  \\end{cases}`;

  line1_system3: string = `\\begin{cases}
  x_I = a_1 t_1 + x_1\\\\
  y_I = b_1 t_1 + y_1 
  \\end{cases}`;
  line2_system3: string = `\\begin{cases}
  x_I = a_2 t_2 + x_2\\\\
  y_I = b_2 t_2 + y_2 
  \\end{cases}`;

  intersection_system1: string = `\\begin{cases}
  a_1 t_1 + x_1 = a_2 t_2 + x_2\\\\
  b_1 t_1 + y_1 = b_2 t_2 + y_2 
  \\end{cases}`;
  intersection_system2: string = `\\Rightarrow \\begin{cases}
  a_1 t_1 - a_2 t_2 = \\Delta x\\;\\;{\\scriptstyle(1)}\\\\
  b_1 t_1 - b_2 t_2 = \\Delta y\\;\\;{\\scriptstyle(2)}
  \\end{cases}`;
  intersection_system3: string = `\\Leftrightarrow \\begin{cases}
  (a_1 b_2 - a_2 b_1) t_2 = b_1 \\Delta x - a_1 \\Delta y\\\\
  b_1 t_1 - b_2 t_2 = \\Delta y\\;\\;{\\scriptstyle(2)}
  \\end{cases}
  \\;\\;or\\;\\;
  \\begin{cases}
  (a_1 b_2 - a_2 b_1) t_1 = b_2 \\Delta x - a_2 \\Delta y\\\\
  b_1 t_1 - b_2 t_2 = \\Delta y\\;\\;{\\scriptstyle(2)}
  \\end{cases}`;
  intersection_system4: string = `t_1 = \\frac{b_2 \\Delta x - a_2 \\Delta y}{a_1 b_2 - a_2 b_1}`;
  intersection_system5: string = `t_2 = \\frac{b_1 \\Delta x - a_1 \\Delta y}{a_1 b_2 - a_2 b_1}`;

  intersection_result_x: string = `x_I = \\frac{a_1 b_2 x_2 - a_2 b_1 x_1 - a_1 a_2 (y_2 - y_1)}{a_1 b_2 - a_2 b_1}`;
  intersection_result_y: string = `y_I = \\frac{a_1 b_2 y_1 - a_2 b_1 y_2 + b_1 b_2 (x_2 - x_1)}{a_1 b_2 - a_2 b_1}`;

  constructor() { }

  ngOnInit(): void {
    this.initMatrix();
    this.initRotations();
    this.initGeometry();
  }

  initMatrix(): void {
    const matrix1 = new NumberMatrix([
      [1, 2],
      [2, 3],
      [1, -2]
    ])
    const matrix2 = new NumberMatrix([
      [1, 2, -4],
      [2, 3, 4]
    ]);
    const matrix3 = matrix1.multiply(matrix2);
    const matrix4 = matrix2.removeColumn(2);
    const matrix5 = new NumberMatrix([
      [1, 2, -4, -1],
      [2, 3, 4, 2],
      [2, 3, 4, -3],
      [6, 7, -5, 1],
    ]);

    this.matrix1 = matrix1.toTex();
    this.matrix2 = matrix2.toTex();
    this.matrix3 = (matrix3 as NumberMatrix).toTex();
    this.matrix4 = (matrix4 as NumberMatrix).toTex();
    this.matrix5 = (matrix5 as NumberMatrix).toTex();
    const determinant1 = new DeterminantNumber(matrix5);
    this.determinantEquality = `${determinant1.toTex()} = ${determinant1.compute()}`;
  }

  initRotations(): void {
    const rotationMatrix2D = new TexMatrix([
      ["\\cos \\theta", "-\\sin \\theta"],
      ["\\sin \\theta", "\\cos \\theta"],
    ]);
    const rotationMatrix3D = new TexMatrix([
      ["\\cos \\theta", "-\\sin \\theta", "0"],
      ["\\sin \\theta", "\\cos \\theta", "0"],
      ["0", "0", "1"],
    ]);
    this.rotation2DMatrix = (rotationMatrix2D as TexMatrix).toTex();
    this.rotation3DMatrix = (rotationMatrix3D as TexMatrix).toTex();

    this.rotatedVector = new NumberVector2D([1, 1]);
    const theta = Math.PI / 4;

    const precision = 3;
    const rotatedVector1 = this.rotatedVector.rotate(theta, precision);
    this.rotation2DEquality = `${rotatedVector1.toTex()} = ${get2DRotationMatrix(theta, precision).toTex()} ${this.rotatedVector.toTex()}`;
  }

  initGeometry(): void {
    
  }

}
