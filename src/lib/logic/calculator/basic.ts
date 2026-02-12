export const addition =(...numbers: number[]): number => {
  return numbers.reduce((acc, num) => acc + num, 0);
}

export const subtraction = (a: number, b: number): number => {
  return a - b;
}

export const multiplication =(...numbers: number[]): number => {
  return numbers.reduce((acc, num) => acc * num, 1);
}

export const division = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error("Division by zero is not allowed.");
  }
  return a / b;
}