// utils.js
export const DEFAULT_MARGINS = [50, 35, 25];

export const fmtMoney = (n) => {
  if (n == null || !isFinite(n)) return '—';
  try { 
    return new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 0}).format(n); 
  } catch(e) { 
    return '₹' + Math.round(n); 
  }
};

export const fmtPct = (n) => {
  if (n == null || !isFinite(n)) return '—';
  return n.toFixed(1) + '%';
};

export const priceForMargin = (ctc, marginPct) => {
  if (!(ctc > 0)) return null;
  const m = Number(marginPct);
  if (!isFinite(m) || m >= 100) return null;
  return ctc / (1 - m / 100);
};

export const generateId = () => {
  return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
};

export const todayISO = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
};

export const normalizedEmail = (e) => String(e || '').trim().toLowerCase();

export const isApproved = (email, settings) => {
  return settings.approvedEmails.map(normalizedEmail).includes(normalizedEmail(email));
};

export const isAdmin = (email, settings) => {
  return settings.admins.map(normalizedEmail).includes(normalizedEmail(email));
};