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
    let node = parseExponent();

    while (
      tokens[i]?.type === "operator" &&
      ["*", "/", "%"].includes(tokens[i].value as string)
    ) {
      const op = tokens[i++].value as "*" | "/" | "%";
      console.log(`[Parser] Found operator: ${op}`);
      const right = parseExponent();
      node = { type: "binary", operator: op, left: node, right };
    }

    return node;
  }

  function parseExponent(): ASTNode {
    let node = parseFactor();

    while (tokens[i]?.type === "operator" && tokens[i]?.value === "^") {
      const op = tokens[i++].value as "^";
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
      return { type: "number", value: token.value as number };
    }

    if (token.type === "constant") {
      return { type: "constant", name: token.value as string, value: token.value === "PI" ? Math.PI : Math.E };
    }

    if (token.type === "function") {
      const funcName = token.value as string;
      if (tokens[i]?.type === "paren" && tokens[i]?.value === "(") {
        i++; // skip '('
        const args: ASTNode[] = [];
        if (tokens[i]?.type !== "paren" || tokens[i]?.value !== ")") {
          args.push(parseExpression());
          while (tokens[i]?.type === "comma") {
            i++; // skip ','
            args.push(parseExpression());
          }
        }
        if (tokens[i]?.type === "paren" && tokens[i]?.value === ")") {
          i++; // skip ')'
          return { type: "function", name: funcName, args };
        }
        throw new Error(`Missing ')' after function ${funcName} arguments`);
      }
      throw new Error(`Missing '(' after function ${funcName}`);
    }

    if (token.type === "paren" && token.value === "(") {
      console.log(`[Parser] Found '('`);
      const node = parseExpression();
      console.log(`[Parser] Found ')'`);
      if (tokens[i]?.type !== "paren" || tokens[i]?.value !== ")") {
        throw new Error("Missing closing parenthesis");
      }
      i++; // skip ")"
      return node;
    }

    throw new Error(`Invalid syntax at token [${token.type}: ${token.value}]`);
  }

  const ast = parseExpression();
  if (i < tokens.length) {
    throw new Error(`Unexpected token at end: ${tokens[i].value}`);
  }
  console.log(`[Parser] Finished parsing. AST:`, JSON.stringify(ast));
  return ast;
}
