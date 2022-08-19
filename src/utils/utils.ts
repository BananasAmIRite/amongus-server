export function randomSubset<T>(set: T[], amount: number) {
  if (amount > set.length) throw new Error('Subset size cannot be greater than the set size');
  const available = [...set];
  const randomSubset: T[] = [];
  for (let i = 0; i < amount; i++) {
    const j = Math.floor(Math.random() * available.length);
    randomSubset.push(available[j]);
    available.splice(j, 1);
  }

  return randomSubset;
}
