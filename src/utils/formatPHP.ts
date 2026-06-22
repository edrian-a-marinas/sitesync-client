export function formatPHP(amount: number, format: 'short' | 'full' = 'full'): string {
  if (format === 'short') {
    if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`;
    return `₱${amount.toFixed(0)}`;
  }
  return `₱${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function getMoneyTooltip(amount: number): string {
  return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}