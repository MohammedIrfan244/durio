import { Token } from "./tokenizer";
import { ASTNode } from "./type"; 

export function parse(tokens: Token[]): ASTNode {
  let i = 0;

  function parseExpression(): ASTNode {
    let node = parseTerm();

    while (
      tokens[i]?.type === "operator" &&
      ["+", "-"].includes(tokens[i].value)
    ) {
      const op = tokens[i++].value as "+" | "-";
      const right = parseTerm();
      node = { type: "binary", operator: op, left: node, right };
    }

    return node;
  }

  function parseTerm(): ASTNode {
    let node = parseFactor();

    while (
      tokens[i]?.type === "operator" &&
      ["*", "/"].includes(tokens[i].value)
    ) {
      const op = tokens[i++].value as "*" | "/";
      const right = parseFactor();
      node = { type: "binary", operator: op, left: node, right };
    }

    return node;
  }

  function parseFactor(): ASTNode {
    const token = tokens[i++];

    if (!token) throw new Error("Unexpected end");

    if (token.type === "number") {
      return { type: "number", value: token.value };
    }

    if (token.value === "(") {
      const node = parseExpression();
      i++; // skip ")"
      return node;
    }

    throw new Error("Invalid syntax");
  }

  return parseExpression();
}
