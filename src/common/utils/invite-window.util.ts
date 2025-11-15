import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import {
  INVITE_WINDOW_END,
  INVITE_WINDOW_START,
} from '../rules/functional-rules'

const TIMEZONE = 'America/Sao_Paulo'

const minutesSinceMidnight = (date: Date): number => {
  const saoPauloTime = toZonedTime(date, TIMEZONE)
  return saoPauloTime.getHours() * 60 + saoPauloTime.getMinutes()
}

export const isWithinInviteWindow = (now: Date): boolean => {
  const saoPauloTime = toZonedTime(now, TIMEZONE)
  const currentDay = saoPauloTime.getDay()
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
  const saoPauloTime = toZonedTime(now, TIMEZONE)
  const end = new Date(saoPauloTime)
  const currentDay = saoPauloTime.getDay()
  const endMinutes = INVITE_WINDOW_END.hour * 60 + INVITE_WINDOW_END.minute
  const currentMinutes = minutesSinceMidnight(now)

  let daysToAdd = (INVITE_WINDOW_END.dayOfWeek - currentDay + 7) % 7
  if (daysToAdd === 0 && currentMinutes > endMinutes) {
    daysToAdd = 7
  }

  end.setDate(end.getDate() + daysToAdd)
  end.setHours(INVITE_WINDOW_END.hour, INVITE_WINDOW_END.minute, 0, 0)
  
  // Converte de volta para UTC
  return fromZonedTime(end, TIMEZONE)
}

export const calculateInviteExpiration = (
  now: Date = new Date(),
  validityHours = 48,
): Date => {
  const saoPauloTime = toZonedTime(now, TIMEZONE)
  const candidate = new Date(saoPauloTime.getTime() + validityHours * 60 * 60 * 1000)
  const windowEnd = getInviteWindowEndDate(now)
  
  // Converte candidate de volta para UTC
  const candidateUTC = fromZonedTime(candidate, TIMEZONE)
  return candidateUTC < windowEnd ? candidateUTC : windowEnd
}
