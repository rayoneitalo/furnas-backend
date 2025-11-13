import {
  INVITE_WINDOW_END,
  INVITE_WINDOW_START,
} from '../rules/functional-rules'

const minutesSinceMidnight = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes()

export const isWithinInviteWindow = (now: Date): boolean => {
  const currentDay = now.getDay()
  const currentMinutes = minutesSinceMidnight(now)

  const startMinutes =
    INVITE_WINDOW_START.hour * 60 + INVITE_WINDOW_START.minute
  const endMinutes = INVITE_WINDOW_END.hour * 60 + INVITE_WINDOW_END.minute

  if (INVITE_WINDOW_START.dayOfWeek === INVITE_WINDOW_END.dayOfWeek) {
    return (
      currentDay === INVITE_WINDOW_START.dayOfWeek &&
      currentMinutes >= startMinutes &&
      currentMinutes <= endMinutes
    )
  }

  if (currentDay === INVITE_WINDOW_START.dayOfWeek) {
    return currentMinutes >= startMinutes
  }

  if (currentDay === INVITE_WINDOW_END.dayOfWeek) {
    return currentMinutes <= endMinutes
  }

  if (INVITE_WINDOW_START.dayOfWeek < INVITE_WINDOW_END.dayOfWeek) {
    return (
      currentDay > INVITE_WINDOW_START.dayOfWeek &&
      currentDay < INVITE_WINDOW_END.dayOfWeek
    )
  }

  return (
    currentDay > INVITE_WINDOW_START.dayOfWeek ||
    currentDay < INVITE_WINDOW_END.dayOfWeek
  )
}

export const getInviteWindowEndDate = (now: Date = new Date()): Date => {
  const end = new Date(now)
  const currentDay = now.getDay()
  const endMinutes = INVITE_WINDOW_END.hour * 60 + INVITE_WINDOW_END.minute
  const currentMinutes = minutesSinceMidnight(now)

  let daysToAdd = (INVITE_WINDOW_END.dayOfWeek - currentDay + 7) % 7
  if (daysToAdd === 0 && currentMinutes > endMinutes) {
    daysToAdd = 7
  }

  end.setDate(end.getDate() + daysToAdd)
  end.setHours(INVITE_WINDOW_END.hour, INVITE_WINDOW_END.minute, 0, 0)
  return end
}

export const calculateInviteExpiration = (
  now: Date = new Date(),
  validityHours = 48,
): Date => {
  const candidate = new Date(now.getTime() + validityHours * 60 * 60 * 1000)
  const windowEnd = getInviteWindowEndDate(now)
  return candidate < windowEnd ? candidate : windowEnd
}
