let rates: Record<string, number> = {
  USD: 1,
  INR: 83,
  EUR: 0.9,
};

let lastFetched = 0;

async function fetchRates() {
  const now = Date.now();
  // Cache for 1 hour
  if (now - lastFetched > 3600000) {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data && data.rates) {
        rates = data.rates;
        lastFetched = now;
      }
    } catch (e) {
      console.error("Failed to fetch rates, using fallback.");
    }
  }
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  await fetchRates();
  if (!rates[from] || !rates[to]) {
    throw new Error("Currency not supported");
  }
  const usd = amount / rates[from];
  return usd * rates[to];
}

export async function getCurrencyUnits(): Promise<string[]> {
  await fetchRates();
  return Object.keys(rates);
}
