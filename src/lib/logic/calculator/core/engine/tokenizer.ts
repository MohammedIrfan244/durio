export type Token =
  | { type: "number"; value: number }
  | { type: "operator"; value: "+" | "-" | "*" | "/" }
  | { type: "paren"; value: "(" | ")" };

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const regex = /\d+(\.\d+)?|[+\-*/()]|\s+/g;

  for (const match of input.matchAll(regex)) {
    const value = match[0];

    if (/^\s+$/.test(value)) continue;

    if (!isNaN(Number(value))) {
      tokens.push({ type: "number", value: Number(value) });
    } else if ("+-*/".includes(value)) {
      tokens.push({ type: "operator", value: value as any });
    } else {
      tokens.push({ type: "paren", value: value as any });
    }
  }

  return tokens;
}
