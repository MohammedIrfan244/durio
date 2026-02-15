const lengthUnits: Record<string, number> = {
  m: 1,
  cm: 100,
  km: 0.001,
};

export function convertUnit(
  value: number,
  from: string,
  to: string
): number {
  const meters = value / lengthUnits[from];
  return meters * lengthUnits[to];
}
