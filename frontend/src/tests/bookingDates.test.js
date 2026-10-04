import { describe, expect, it } from 'vitest';
import {
  getTodayDateInputValue,
  isBookingDateAllowed,
} from '@/utils/bookingDates.js';

describe('bookingDates', () => {
  it('formats today for a date input using local calendar fields', () => {
    expect(getTodayDateInputValue(new Date(2026, 9, 5, 23, 30))).toBe(
      '2026-10-05',
    );
  });

  it('accepts today and the maximum booking date', () => {
    expect(isBookingDateAllowed('2026-10-05', '2026-10-05')).toBe(true);
    expect(isBookingDateAllowed('2050-12-31', '2026-10-05')).toBe(true);
  });

  it('rejects yesterday and dates after the maximum', () => {
    expect(isBookingDateAllowed('2026-10-04', '2026-10-05')).toBe(false);
    expect(isBookingDateAllowed('2051-01-01', '2026-10-05')).toBe(false);
  });
});
