export const statistics = {
  count: (data: number[]): number => data.length,

  sum: (data: number[]): number => data.reduce((a, b) => a + b, 0),

  min: (data: number[]): number => data.length ? Math.min(...data) : 0,

  max: (data: number[]): number => data.length ? Math.max(...data) : 0,

  mean: (data: number[]): number => {
    if (data.length === 0) return 0;
    return statistics.sum(data) / data.length;
  },

  median: (data: number[]): number => {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 !== 0) return sorted[mid];
    return (sorted[mid - 1] + sorted[mid]) / 2;
  },

  mode: (data: number[]): number[] => {
    if (data.length === 0) return [];
    const counts: Record<number, number> = {};
    let maxCount = 0;
    let modes: number[] = [];

    for (const num of data) {
      counts[num] = (counts[num] || 0) + 1;
      if (counts[num] > maxCount) {
        maxCount = counts[num];
        modes = [num];
      } else if (counts[num] === maxCount) {
        if (!modes.includes(num)) modes.push(num);
      }
    }

    return modes;
  },

  variance: (data: number[], population: boolean = false): number => {
    if (data.length <= (population ? 0 : 1)) return 0;
    const mean = statistics.mean(data);
    return data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (data.length - (population ? 0 : 1));
  },

  stdDev: (data: number[], population: boolean = false): number => {
    return Math.sqrt(statistics.variance(data, population));
  },

  factorial: (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  },

  nPr: (n: number, r: number): number => {
    if (n < 0 || r < 0 || r > n) return NaN;
    return Math.round(statistics.factorial(n) / statistics.factorial(n - r));
  },

  nCr: (n: number, r: number): number => {
    if (n < 0 || r < 0 || r > n) return NaN;
    return Math.round(statistics.factorial(n) / (statistics.factorial(r) * statistics.factorial(n - r)));
  }
};
