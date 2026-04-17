import { Token } from "./tokenizer";
import { ASTNode } from "./type"; 

export function parse(tokens: Token[]): ASTNode {
  console.log(`[Parser] Starting parsing with ${tokens.length} tokens`);
  let i = 0;

  function parseExpression(): ASTNode {
    console.log(`[Parser] Parsing expression at index ${i}`);
    let node = parseTerm();

    while (
      tokens[i]?.type === "operator" &&
      ["+", "-"].includes(tokens[i].value as string)
    ) {
      const op = tokens[i++].value as "+" | "-";
      console.log(`[Parser] Found operator: ${op}`);
      const right = parseTerm();
      node = { type: "binary", operator: op, left: node, right };
    }

    return node;
  }

  function parseTerm(): ASTNode {
    console.log(`[Parser] Parsing term at index ${i}`);
    let node = parseFactor();

    while (
      tokens[i]?.type === "operator" &&
      ["*", "/", "^", "%"].includes(tokens[i].value as string)
    ) {
      const op = tokens[i++].value as "*" | "/" | "^" | "%";
      console.log(`[Parser] Found operator: ${op}`);
      const right = parseFactor();
      node = { type: "binary", operator: op, left: node, right };
    }

    return node;
  }

  function parseFactor(): ASTNode {
    console.log(`[Parser] Parsing factor at index ${i}`);
    const token = tokens[i++];

    if (!token) throw new Error("Unexpected end");

    if (token.type === "number") {
      console.log(`[Parser] Found number: ${token.value}`);
      return { type: "number", value: token.value };
    }

    if (token.value === "(") {
      console.log(`[Parser] Found '('`);
      const node = parseExpression();
      console.log(`[Parser] Found ')'`);
      i++; // skip ")"
      return node;
    }

    throw new Error("Invalid syntax");
  }

  const ast = parseExpression();
  console.log(`[Parser] Finished parsing. AST:`, JSON.stringify(ast));
  return ast;
}
