export type ASTNode =
  | { type: "number"; value: number }
  | { type: "constant"; name: string; value: number }
  | { type: "variable"; name: string }
  | { type: "function"; name: string; args: ASTNode[] }
  | {
      type: "binary";
      operator: Operator;
      left: ASTNode;
      right: ASTNode;
    };

export type Operator = "+" | "-" | "*" | "/" | "^" | "%";
export type TokenType = "number" | "operator" | "paren" | "function" | "constant" | "comma" | "variable";
export type ParenType = "(" | ")";
export type MathFunction = "sin" | "cos" | "tan" | "asin" | "acos" | "atan" | "log" | "ln" | "sqrt" | "abs" | "fact" | "exp";
export type MathConstant = "PI" | "E";