import { ASTNode } from "../core/engine/type";
import { tokenize } from "../core/engine/tokenizer";
import { parse } from "../core/engine/parser";
import { evaluate } from "../core/engine/evaluator";

export const symbolicLogic = {
  // --- SYMBOLIC DIFFERENTIATION ---
  
  diff: (node: ASTNode, v: string): ASTNode => {
    switch (node.type) {
      case "number":
      case "constant":
        return { type: "number", value: 0 };
      
      case "variable":
        return node.name === v ? { type: "number", value: 1 } : { type: "number", value: 0 };
      
      case "binary":
        const { operator, left, right } = node;
        switch (operator) {
          case "+":
          case "-":
            return { type: "binary", operator, left: symbolicLogic.diff(left, v), right: symbolicLogic.diff(right, v) };
          
          case "*":
            // Product Rule: (f*g)' = f'g + fg'
            return {
              type: "binary",
              operator: "+",
              left: { type: "binary", operator: "*", left: symbolicLogic.diff(left, v), right },
              right: { type: "binary", operator: "*", left, right: symbolicLogic.diff(right, v) }
            };
          
          case "/":
            // Quotient Rule: (f'g - fg') / g^2
            return {
              type: "binary",
              operator: "/",
              left: {
                type: "binary",
                operator: "-",
                left: { type: "binary", operator: "*", left: symbolicLogic.diff(left, v), right },
                right: { type: "binary", operator: "*", left, right: symbolicLogic.diff(right, v) }
              },
              right: { type: "binary", operator: "^", left: right, right: { type: "number", value: 2 } }
            };
          
          case "^":
            if (right.type === "number") {
              return {
                type: "binary",
                operator: "*",
                left: {
                  type: "binary",
                  operator: "*",
                  left: right,
                  right: { type: "binary", operator: "^", left, right: { type: "number", value: right.value - 1 } }
                },
                right: symbolicLogic.diff(left, v)
              };
            }
            return { type: "number", value: 0 };
            
          default:
            return { type: "number", value: 0 };
        }

      case "function":
        const arg = node.args[0];
        const argDiff = symbolicLogic.diff(arg, v);
        
        switch (node.name) {
          case "sin":
            return { type: "binary", operator: "*", left: { type: "function", name: "cos", args: [arg] }, right: argDiff };
          case "cos":
            return { 
              type: "binary", 
              operator: "*", 
              left: { type: "binary", operator: "*", left: { type: "number", value: -1 }, right: { type: "function", name: "sin", args: [arg] } }, 
              right: argDiff 
            };
          case "tan":
            return {
              type: "binary",
              operator: "/",
              left: argDiff,
              right: { type: "binary", operator: "^", left: { type: "function", name: "cos", args: [arg] }, right: { type: "number", value: 2 } }
            };
          case "exp":
            return { type: "binary", operator: "*", left: node, right: argDiff };
          case "ln":
            return { type: "binary", operator: "/", left: argDiff, right: arg };
          default:
            return { type: "number", value: 0 };
        }
    }
  },

  simplify: (node: ASTNode): ASTNode => {
    if (node.type === "binary") {
      const left = symbolicLogic.simplify(node.left);
      const right = symbolicLogic.simplify(node.right);
      
      if (left.type === "number" && right.type === "number") {
        if (node.operator === "+") return { type: "number", value: left.value + right.value };
        if (node.operator === "-") return { type: "number", value: left.value - right.value };
        if (node.operator === "*") return { type: "number", value: left.value * right.value };
        if (node.operator === "/") return { type: "number", value: left.value / right.value };
        if (node.operator === "^") return { type: "number", value: Math.pow(left.value, right.value) };
      }

      if (node.operator === "+") {
        if (left.type === "number" && left.value === 0) return right;
        if (right.type === "number" && right.value === 0) return left;
      }
      if (node.operator === "*") {
        if (left.type === "number") {
          if (left.value === 0) return { type: "number", value: 0 };
          if (left.value === 1) return right;
        }
        if (right.type === "number") {
          if (right.value === 0) return { type: "number", value: 0 };
          if (right.value === 1) return left;
        }
      }
      if (node.operator === "^") {
        if (right.type === "number" && right.value === 0) return { type: "number", value: 1 };
        if (right.type === "number" && right.value === 1) return left;
      }

      return { ...node, left, right };
    }
    
    if (node.type === "function") {
      return { ...node, args: node.args.map(symbolicLogic.simplify) };
    }

    return node;
  },

  toString: (node: ASTNode): string => {
    switch (node.type) {
      case "number": return node.value < 0 ? `(${node.value})` : `${node.value}`;
      case "constant": return node.name;
      case "variable": return node.name;
      case "function": return `${node.name}(${node.args.map(symbolicLogic.toString).join(", ")})`;
      case "binary":
        let l = symbolicLogic.toString(node.left);
        let r = symbolicLogic.toString(node.right);
        if (node.left.type === "binary" && (node.operator === "*" || node.operator === "/" || node.operator === "^")) l = `(${l})`;
        if (node.right.type === "binary" && (node.operator === "*" || node.operator === "/" || node.operator === "^")) r = `(${r})`;
        return `${l} ${node.operator} ${r}`;
    }
  },

  evaluateString: (expr: string, x: number): number => {
    try {
      const tokens = tokenize(expr);
      const ast = parse(tokens);
      return evaluate(ast, { variables: { x, t: x } });
    } catch { return NaN; }
  },

  // --- SOLVERS ---

  solveQuadratic: (a: number, b: number, c: number) => {
    const disc = b * b - 4 * a * c;
    if (disc > 0) return [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)];
    if (disc === 0) return [-b / (2 * a)];
    const real = -b / (2 * a);
    const imag = Math.sqrt(-disc) / (2 * a);
    return [`${real.toFixed(2)} + ${imag.toFixed(2)}i`, `${real.toFixed(2)} - ${imag.toFixed(2)}i`];
  },

  solveCubic: (a: number, b: number, c: number, d: number) => {
    const f = (x: number) => a*x**3 + b*x**2 + c*x + d;
    const df = (x: number) => 3*a*x**2 + 2*b*x + c;
    let x0 = 0;
    for(let i=0; i<30; i++) {
        const dxi = f(x0)/df(x0);
        if (isNaN(dxi)) break;
        x0 = x0 - dxi;
    }
    const b2 = b + a*x0;
    const c2 = c + b*x0 + a*x0**2;
    const others = symbolicLogic.solveQuadratic(a, b2, c2);
    return [x0, ...others].map(v => typeof v === 'number' ? parseFloat(v.toFixed(4)) : v);
  },

  integral: (expr: string, a: number, b: number, n: number = 100): number => {
    try {
      const tokens = tokenize(expr);
      const ast = parse(tokens);
      const evalAt = (val: number) => evaluate(ast, { variables: { x: val, t: val } });
      const h = (b - a) / n;
      let sum = evalAt(a) + evalAt(b);
      for (let i = 1; i < n; i++) sum += evalAt(a + i * h) * (i % 2 === 0 ? 2 : 4);
      return (h / 3) * sum;
    } catch { return NaN; }
  }
};
