import { ASTNode } from "./type";

export function evaluate(node: ASTNode): number {
  if (node.type === "number") return node.value;

  const left = evaluate(node.left);
  const right = evaluate(node.right);

  switch (node.operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
  }
}
