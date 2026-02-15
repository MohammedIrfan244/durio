const rates: Record<string, number> = {
  USD: 1,
  INR: 83,
  EUR: 0.9,
};

export function convertCurrency(
  amount: number,
  from: string,
  to: string
): number {
  const usd = amount / rates[from];
  return usd * rates[to];
}
