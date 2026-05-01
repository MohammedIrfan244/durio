import { tokenize } from "./engine/tokenizer";
import { parse } from "./engine/parser";
import { evaluate, EvalOptions } from "./engine/evaluator";

export function evaluateExpression(input: string, options?: EvalOptions): number {
  console.log(`[Core] Starting evaluation for: "${input}"`);
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast, options);
  console.log(`[Core] Final result: ${result}`);
  return result;
}
