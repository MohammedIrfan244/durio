import { convertCurrency, getCurrencyUnits } from "./currency";
import { convertLength, convertMass, convertTime, convertTemperature, lengthUnits, massUnits, timeUnits } from "./unit";

export const converter = {
  currency: convertCurrency,
  length: convertLength,
  mass: convertMass,
  time: convertTime,
  temperature: convertTemperature,
  units: {
    length: Object.keys(lengthUnits),
    mass: Object.keys(massUnits),
    time: Object.keys(timeUnits),
    temperature: ["C", "F", "K"],
  },
  getCurrencyUnits
};
