import { evaluateExpression } from "../core";
import { EvalOptions } from "../core/engine/evaluator";

export function calculate(expression: string, options?: EvalOptions): number {
  return evaluateExpression(expression, options);
}
