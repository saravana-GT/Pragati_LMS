// Date helpers
export const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (timestamp) => {
  if (!timestamp) return '—';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const d = new Date(year, parseInt(month) - 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const calcDuration = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const inD  = checkIn.toDate  ? checkIn.toDate()  : new Date(checkIn);
  const outD = checkOut.toDate ? checkOut.toDate() : new Date(checkOut);
  const diff = Math.round((outD - inD) / 60000);
  return diff > 0 ? diff : 0;
};

// Generate receipt number: RCP-YYYYMM-XXXX
export const generateReceiptNumber = (index) => {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `RCP-${ym}-${String(index).padStart(4, '0')}`;
};
