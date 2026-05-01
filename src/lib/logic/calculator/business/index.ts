export const business = {
  simpleInterest: (principal: number, rate: number, time: number): number => {
    return (principal * rate * time) / 100;
  },

  compoundInterest: (principal: number, rate: number, time: number, compoundsPerYear: number = 1): number => {
    const amount = principal * Math.pow(1 + (rate / 100) / compoundsPerYear, compoundsPerYear * time);
    return amount - principal;
  },

  emi: (principal: number, rate: number, timeInMonths: number): number => {
    if (rate === 0) return principal / timeInMonths;
    const r = rate / 12 / 100; // monthly rate
    const num = principal * r * Math.pow(1 + r, timeInMonths);
    const den = Math.pow(1 + r, timeInMonths) - 1;
    return num / den;
  },

  roi: (initialInvestment: number, finalValue: number): number => {
    if (initialInvestment === 0) return 0;
    return ((finalValue - initialInvestment) / initialInvestment) * 100;
  }
};
