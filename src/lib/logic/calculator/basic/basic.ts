import { evaluateExpression } from "../core";

export function calculate(expression: string): number {
  return evaluateExpression(expression);
}
