export type RandomFn = () => number;

export type RandomSelectionResult<T> =
  | {
      ok: true;
      item: T;
      index: number;
    }
  | {
      ok: false;
      message: string;
    };

export function selectRandomItem<T>(
  items: readonly T[],
  random: RandomFn,
): RandomSelectionResult<T> {
  if (items.length === 0) {
    return {
      ok: false,
      message: "Cannot select from an empty list.",
    };
  }

  const randomValue = random();
  const boundedValue = Math.min(Math.max(randomValue, 0), 1);
  const index = Math.min(Math.floor(boundedValue * items.length), items.length - 1);

  return {
    ok: true,
    item: items[index],
    index,
  };
}
