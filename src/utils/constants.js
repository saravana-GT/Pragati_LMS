// App-wide constants — adjust these to match your center
export const SHIFTS = ['morning', 'evening'];

export const SEATS_PER_SHIFT = 30; // 30 morning + 30 evening = 60 total

export const MONTHLY_FEE = 500; // INR

export const CENTER_NAME = 'Pragati Abhyasika';

export const ADMIN_EMAIL = 'admin@pragatiabhyasika.com'; // change to your admin email

export const SHIFT_LABELS = {
  morning: '🌅 Morning',
  evening: '🌙 Evening',
};

export const STATUS_COLORS = {
  available: '#22c55e',
  occupied:  '#ef4444',
  reserved:  '#f59e0b',
};

export const PAYMENT_STATUS = {
  paid:   { label: 'Paid',   color: '#22c55e', bg: '#dcfce7' },
  unpaid: { label: 'Unpaid', color: '#ef4444', bg: '#fee2e2' },
};
