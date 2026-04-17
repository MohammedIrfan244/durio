import { ASTNode } from "./type";

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function evaluate(node: ASTNode): number {
  if (node.type === "number") {
    console.log(`[Evaluator] Number node: ${node.value}`);
    return node.value;
  }

  if (node.type === "constant") {
    console.log(`[Evaluator] Constant node: ${node.name} = ${node.value}`);
    return node.value;
  }

  if (node.type === "function") {
    console.log(`[Evaluator] Function node: ${node.name}`);
    const args = node.args.map(evaluate);
    switch (node.name) {
      case "sin": return Math.sin(args[0]);
      case "cos": return Math.cos(args[0]);
      case "tan": return Math.tan(args[0]);
      case "asin": return Math.asin(args[0]);
      case "acos": return Math.acos(args[0]);
      case "atan": return Math.atan(args[0]);
      case "log": return Math.log10(args[0]);
      case "ln": return Math.log(args[0]);
      case "sqrt": return Math.sqrt(args[0]);
      case "abs": return Math.abs(args[0]);
      case "fact": return factorial(args[0]);
      default: throw new Error(`Unknown function: ${node.name}`);
    }
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
