export const lengthUnits: Record<string, number> = {
  m: 1,
  cm: 100,
  mm: 1000,
  km: 0.001,
  in: 39.3701,
  ft: 3.28084,
  yd: 1.09361,
  mi: 0.000621371,
};

export const massUnits: Record<string, number> = {
  kg: 1,
  g: 1000,
  mg: 1000000,
  lb: 2.20462,
  oz: 35.274,
};

export const timeUnits: Record<string, number> = {
  s: 1,
  ms: 1000,
  min: 1 / 60,
  h: 1 / 3600,
  d: 1 / 86400,
};

export function convertLength(value: number, from: string, to: string): number {
  const meters = value / lengthUnits[from];
  return meters * lengthUnits[to];
}

export function convertMass(value: number, from: string, to: string): number {
  const kg = value / massUnits[from];
  return kg * massUnits[to];
}

export function convertTime(value: number, from: string, to: string): number {
  const sec = value / timeUnits[from];
  return sec * timeUnits[to];
}

export function convertTemperature(value: number, from: string, to: string): number {
  let celsius = value;
  
  if (from === "F") celsius = (value - 32) * 5 / 9;
  else if (from === "K") celsius = value - 273.15;

  if (to === "F") return (celsius * 9 / 5) + 32;
  if (to === "K") return celsius + 273.15;
  return celsius;
}
