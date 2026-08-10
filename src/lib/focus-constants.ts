export const DAYS = [
  { label: 'Su', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'Th', value: 4 },
  { label: 'F', value: 5 },
  { label: 'Sa', value: 6 },
];

export const FOCUS_INSIGHTS = {
  HIGH_ENERGY: [
    "You have a lot of High Energy blocks today. Make sure to hydrate and take deep breaths!",
    "Today's flow is intense. Protect your transition rituals to avoid burnout.",
    "A powerhouse day! Knock out the big tasks while your energy is peaking."
  ],
  BALANCED: [
    "Your day looks beautifully balanced. Perfect rhythm of work and recovery.",
    "A steady flow state today. Keep your momentum going.",
    "Great mix of energy levels today. Enjoy the structured flow!"
  ],
  LOW_RECOVERY: [
    "Taking it easy today. Use this time to recharge and plan ahead.",
    "A lighter load today. Perfect for deep reflection or creative exploration.",
    "Recovery is just as important as the hustle. Enjoy the chill vibe."
  ],
  EMPTY: [
    "No blocks scheduled for this day yet. Time to design your flow!",
    "A blank canvas. What will you achieve today?",
    "Your timeline is empty. Add a new block to get started."
  ]
};

export function getInsightForDay(blocksCount: number, highEnergyCount: number, recoveryCount: number): string {
  if (blocksCount === 0) {
    return FOCUS_INSIGHTS.EMPTY[Math.floor(Math.random() * FOCUS_INSIGHTS.EMPTY.length)];
  }
  
  if (highEnergyCount > recoveryCount * 2 || highEnergyCount >= 3) {
    return FOCUS_INSIGHTS.HIGH_ENERGY[Math.floor(Math.random() * FOCUS_INSIGHTS.HIGH_ENERGY.length)];
  }
  
  if (recoveryCount > highEnergyCount) {
    return FOCUS_INSIGHTS.LOW_RECOVERY[Math.floor(Math.random() * FOCUS_INSIGHTS.LOW_RECOVERY.length)];
  }
  
  return FOCUS_INSIGHTS.BALANCED[Math.floor(Math.random() * FOCUS_INSIGHTS.BALANCED.length)];
}
