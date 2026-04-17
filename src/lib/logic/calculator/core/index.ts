import { tokenize } from "./engine/tokenizer";
import { parse } from "./engine/parser";
import { evaluate } from "./engine/evaluator";

export function evaluateExpression(input: string): number {
  console.log(`[Core] Starting evaluation for: "${input}"`);
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);
  console.log(`[Core] Final result: ${result}`);
  return result;
}
