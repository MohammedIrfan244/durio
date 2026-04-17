import { ASTNode } from "./type";

export function evaluate(node: ASTNode): number {
  if (node.type === "number") {
    console.log(`[Evaluator] Number node: ${node.value}`);
    return node.value;
  }

  console.log(`[Evaluator] Binary node: ${node.operator}`);
  const left = evaluate(node.left);
  const right = evaluate(node.right);

  let result;
  switch (node.operator) {
    case "+":
      result = left + right;
      break;
    case "-":
      result = left - right;
      break;
    case "*":
      result = left * right;
      break;
    case "/":
      result = left / right;
      break;
    case "^":
      result = Math.pow(left, right);
      break;
    case "%":
      result = left % right;
      break;
  }
  
  console.log(`[Evaluator] Evaluated ${left} ${node.operator} ${right} = ${result}`);
  return result as number;
}
