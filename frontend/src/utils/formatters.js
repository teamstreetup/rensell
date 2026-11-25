export function formatINR(amount) {
  const num = Number(amount || 0);
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getTomorrowDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function getNextDayStr(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function calculateRentalDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateSecurityDeposit(originalPrice) {
  return Math.round(Number(originalPrice || 0) * 0.2);
}
