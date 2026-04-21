export function formatBalance(value: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";

  return numeric.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}
