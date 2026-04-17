export type Matrix = number[][];

export const matrixLogic = {
  add: (a: Matrix, b: Matrix): Matrix => {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error("Dimension mismatch for addition");
    }
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  },

  subtract: (a: Matrix, b: Matrix): Matrix => {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error("Dimension mismatch for subtraction");
    }
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
  },

  multiplyScalar: (a: Matrix, scalar: number): Matrix => {
    return a.map(row => row.map(val => val * scalar));
  },

  multiply: (a: Matrix, b: Matrix): Matrix => {
    if (a[0].length !== b.length) {
      throw new Error("Inner dimensions must match for multiplication");
    }
    const result: Matrix = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < a[0].length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  },

  transpose: (a: Matrix): Matrix => {
    return a[0].map((_, colIndex) => a.map(row => row[colIndex]));
  },

  determinant: (m: Matrix): number => {
    const size = m.length;
    if (size !== m[0].length) throw new Error("Matrix must be square");
    if (size === 1) return m[0][0];
    if (size === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

    let det = 0;
    for (let i = 0; i < size; i++) {
        det += Math.pow(-1, i) * m[0][i] * matrixLogic.determinant(matrixLogic.minor(m, 0, i));
    }
    return det;
  },

  minor: (m: Matrix, row: number, col: number): Matrix => {
    return m
      .filter((_, i) => i !== row)
      .map(r => r.filter((_, j) => j !== col));
  },

  inverse: (m: Matrix): Matrix => {
    const det = matrixLogic.determinant(m);
    if (det === 0) throw new Error("Matrix is singular (det=0)");
    const size = m.length;
    if (size === 1) return [[1 / m[0][0]]];

    const adjugate: Matrix = Array(size).fill(0).map(() => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        adjugate[j][i] = Math.pow(-1, i + j) * matrixLogic.determinant(matrixLogic.minor(m, i, j));
      }
    }
    return adjugate.map(row => row.map(val => val / det));
  },

  rref: (m: Matrix): Matrix => {
    const result = m.map(row => [...row]);
    let pivot = 0;
    const rowCount = result.length;
    const colCount = result[0].length;

    for (let r = 0; r < rowCount; r++) {
      if (pivot >= colCount) break;
      let i = r;
      while (result[i][pivot] === 0) {
        i++;
        if (i === rowCount) {
          i = r;
          pivot++;
          if (pivot === colCount) return result;
        }
      }

      // Swap rows
      [result[i], result[r]] = [result[r], result[i]];

      // Divide by pivot
      const lv = result[r][pivot];
      result[r] = result[r].map(x => x / lv);

      // Eliminate other rows
      for (let i = 0; i < rowCount; i++) {
        if (i !== r) {
          const lv2 = result[i][pivot];
          result[i] = result[i].map((x, j) => x - lv2 * result[r][j]);
        }
      }
      pivot++;
    }
    return result;
  }
};
