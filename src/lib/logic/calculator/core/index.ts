import { tokenize } from "./engine/tokenizer";
import { parse } from "./engine/parser";
import { evaluate } from "./engine/evaluator";

export function evaluateExpression(input: string): number {
  const tokens = tokenize(input);
  const ast = parse(tokens);
  return evaluate(ast);
}
