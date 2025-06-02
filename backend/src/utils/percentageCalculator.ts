export function calculatePercentages(classification: [string, string][]): { natural: number, synthetic: number } {
  const total = classification.length;
  const naturalCount = classification.filter(([_, type]) => type === 'natural').length;
  const syntheticCount = classification.filter(([_, type]) => type === 'synthetic').length;

  return {
    natural: (naturalCount / total) * 100,
    synthetic: (syntheticCount / total) * 100
  };
} 