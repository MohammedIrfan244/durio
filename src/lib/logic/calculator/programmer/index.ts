export const programmer = {
  toBinary: (num: number): string => (num >>> 0).toString(2),
  toOctal: (num: number): string => (num >>> 0).toString(8),
  toHex: (num: number): string => (num >>> 0).toString(16).toUpperCase(),

  bitwiseAnd: (a: number, b: number): number => a & b,
  bitwiseOr: (a: number, b: number): number => a | b,
  bitwiseXor: (a: number, b: number): number => a ^ b,
  bitwiseNot: (a: number): number => ~a,
  leftShift: (a: number, b: number): number => a << b,
  rightShift: (a: number, b: number): number => a >> b,
};
