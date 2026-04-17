import { ASTNode } from "./type";

function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export type EvalOptions = { 
  angleMode?: "deg" | "rad";
  variables?: Record<string, number>;
};

export function evaluate(node: ASTNode, options: EvalOptions = { angleMode: "rad" }): number {
  if (node.type === "number") {
    return node.value;
  }

  if (node.type === "constant") {
    return node.value;
  }

  if (node.type === "variable") {
    const val = options.variables?.[node.name];
    if (val === undefined) throw new Error(`Undefined variable: ${node.name}`);
    return val;
  }

  if (node.type === "function") {
    console.log(`[Evaluator] Function node: ${node.name}`);
    const args = node.args.map((n) => evaluate(n, options));
    
    let arg0 = args[0];
    if (options.angleMode === "deg" && ["sin", "cos", "tan"].includes(node.name)) {
      arg0 = arg0 * (Math.PI / 180);
    }

    let res: number;
    switch (node.name) {
      case "sin": res = Math.sin(arg0); break;
      case "cos": res = Math.cos(arg0); break;
      case "tan": res = Math.tan(arg0); break;
      case "asin": res = Math.asin(arg0); break;
      case "acos": res = Math.acos(arg0); break;
      case "atan": res = Math.atan(arg0); break;
      case "log": res = Math.log10(arg0); break;
      case "ln": res = Math.log(arg0); break;
      case "sqrt": res = Math.sqrt(arg0); break;
      case "abs": res = Math.abs(arg0); break;
      case "fact": res = factorial(arg0); break;
      default: throw new Error(`Unknown function: ${node.name}`);
    }

    if (options.angleMode === "deg" && ["asin", "acos", "atan"].includes(node.name)) {
      res = res * (180 / Math.PI);
    }

    return res;
  }

  console.log(`[Evaluator] Binary node: ${node.operator}`);
  const left = evaluate(node.left, options);
  const right = evaluate(node.right, options);

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
