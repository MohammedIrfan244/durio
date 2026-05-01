export const percentage = {
  // Calculate what X% of Y is. e.g. 20% of 500 = 100
  percentOf: (percent: number, value: number) => {
    return (percent / 100) * value;
  },

  // Calculate adding X% to Y. e.g. 500 + 20% = 600
  addPercent: (value: number, percent: number) => {
    return value + (value * (percent / 100));
  },

  // Calculate subtracting X% from Y. e.g. 500 - 15% = 425
  subtractPercent: (value: number, percent: number) => {
    return value - (value * (percent / 100));
  },

  // Calculate what percentage X is of Y. e.g. 100 is what % of 500 = 20%
  percentIsOf: (value1: number, value2: number) => {
    if (value2 === 0) return 0;
    return (value1 / value2) * 100;
  }
};
