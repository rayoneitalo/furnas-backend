import {
  calculateInviteExpiration,
  getInviteWindowEndDate,
  isWithinInviteWindow,
} from '../invite-window.util'

const dateLocal = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Date => new Date(year, month - 1, day, hour, minute)

describe('invite window utilities', () => {
  describe('isWithinInviteWindow', () => {
    it('returns false before the window opens (Monday)', () => {
      expect(isWithinInviteWindow(dateLocal(2025, 1, 6, 23))).toBe(false)
    })

    it('returns true exactly at window opening (Tuesday 00:00)', () => {
      expect(isWithinInviteWindow(dateLocal(2025, 1, 7, 0))).toBe(true)
    })

    it('returns true within the window (Wednesday)', () => {
      expect(isWithinInviteWindow(dateLocal(2025, 1, 8, 12, 30))).toBe(true)
    })

    it('returns true exactly at window closing time (Thursday 14:00)', () => {
      expect(isWithinInviteWindow(dateLocal(2025, 1, 9, 14))).toBe(true)
    })

    it('returns false after the window closes (Thursday 14:01)', () => {
      expect(isWithinInviteWindow(dateLocal(2025, 1, 9, 14, 1))).toBe(false)
    })

    it('returns false on Friday', () => {
      expect(isWithinInviteWindow(dateLocal(2025, 1, 10, 9))).toBe(false)
    })
  })

  describe('getInviteWindowEndDate', () => {
    it('returns the Thursday 14:00 of the current window when inside the window', () => {
      const now = dateLocal(2025, 1, 8, 10) // Wednesday 10:00
      const result = getInviteWindowEndDate(now)
      expect(result.getTime()).toBe(dateLocal(2025, 1, 9, 14).getTime())
    })

    it('returns the next Thursday when current time already passed the window end', () => {
      const now = dateLocal(2025, 1, 9, 16) // Thursday 16:00 -> next week
      const result = getInviteWindowEndDate(now)
      expect(result.getTime()).toBe(dateLocal(2025, 1, 16, 14).getTime())
    })
  })

  describe('calculateInviteExpiration', () => {
    it('respects the 48h validity when inside the window and before closing', () => {
      const now = dateLocal(2025, 1, 7, 9) // Tuesday 09:00
      const result = calculateInviteExpiration(now)
      expect(result.getTime()).toBe(dateLocal(2025, 1, 9, 9).getTime())
    })

    it('caps the expiration at window end when 48h would exceed closing time', () => {
      const now = dateLocal(2025, 1, 8, 20) // Wednesday 20:00 -> 48h later would be Friday 20:00
      const result = calculateInviteExpiration(now)
      expect(result.getTime()).toBe(dateLocal(2025, 1, 9, 14).getTime())
    })
  })
})
