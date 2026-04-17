import { Operator, ParenType, MathFunction, MathConstant } from "./type";

export type Token =
  | { type: "number"; value: number }
  | { type: "operator"; value: Operator }
  | { type: "paren"; value: ParenType }
  | { type: "function"; value: MathFunction }
  | { type: "constant"; value: MathConstant }
  | { type: "comma"; value: "," };

export function tokenize(input: string): Token[] {
  console.log(`[Tokenizer] Input: "${input}"`);
  const tokens: Token[] = [];
  const regex = /\d+(\.\d+)?|[a-zA-Z]+|[+\-*/^%,()]|\s+/g;

  for (const match of input.matchAll(regex)) {
    const value = match[0];

    if (/^\s+$/.test(value)) continue;

    if (!isNaN(Number(value))) {
      tokens.push({ type: "number", value: Number(value) });
      console.log(`[Tokenizer] Token: NUMBER (${value})`);
    } else if ("+-*/^%".includes(value)) {
      tokens.push({ type: "operator", value: value as Operator });
      console.log(`[Tokenizer] Token: OPERATOR (${value})`);
    } else if (value === "(" || value === ")") {
      tokens.push({ type: "paren", value: value as ParenType });
      console.log(`[Tokenizer] Token: PAREN (${value})`);
    } else if (value === ",") {
      tokens.push({ type: "comma", value: "," });
      console.log(`[Tokenizer] Token: COMMA (${value})`);
    } else if (/^[a-zA-Z]+$/.test(value)) {
      if (value === "PI" || value === "E") {
        tokens.push({ type: "constant", value: value as MathConstant });
        console.log(`[Tokenizer] Token: CONSTANT (${value})`);
      } else {
        tokens.push({ type: "function", value: value as MathFunction });
        console.log(`[Tokenizer] Token: FUNCTION (${value})`);
      }
    } else {
      throw new Error(`[Tokenizer] Unknown token: ${value}`);
    }
  }

  console.log(`[Tokenizer] Result: ${tokens.length} tokens`);
  return tokens;
}
