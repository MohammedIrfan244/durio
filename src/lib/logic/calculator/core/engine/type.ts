export type ASTNode =
  | { type: "number"; value: number }
  | {
      type: "binary";
      operator: "+" | "-" | "*" | "/";
      left: ASTNode;
      right: ASTNode;
    };
