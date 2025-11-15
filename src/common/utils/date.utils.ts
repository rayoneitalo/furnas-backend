import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { INVITE_WINDOW_END, LIST_OPEN_TIME } from '../rules/functional-rules'

const TIMEZONE = 'America/Sao_Paulo'

const cloneDate = (date: Date): Date => new Date(date.getTime())

export const getCurrentWeekListOpening = (now: Date = new Date()): Date => {
  // Converte para o timezone de São Paulo
  const saoPauloTime = toZonedTime(now, TIMEZONE)
  const result = cloneDate(saoPauloTime)
  const currentDay = result.getDay()
  const daysSinceOpening = (currentDay - LIST_OPEN_TIME.dayOfWeek + 7) % 7

  result.setDate(result.getDate() - daysSinceOpening)
  result.setHours(LIST_OPEN_TIME.hour, LIST_OPEN_TIME.minute, 0, 0)

  // Converte de volta para UTC para armazenar no banco
  return fromZonedTime(result, TIMEZONE)
}

export const getListClosingFromOpening = (opening: Date): Date => {
  // Converte para o timezone de São Paulo
  const saoPauloOpening = toZonedTime(opening, TIMEZONE)
  const closing = cloneDate(saoPauloOpening)
  const dayOffset =
    (INVITE_WINDOW_END.dayOfWeek - LIST_OPEN_TIME.dayOfWeek + 7) % 7

  closing.setDate(closing.getDate() + dayOffset)
  closing.setHours(INVITE_WINDOW_END.hour, INVITE_WINDOW_END.minute, 0, 0)

  // Converte de volta para UTC
  return fromZonedTime(closing, TIMEZONE)
}

export const getNextWeekListOpening = (opening: Date): Date => {
  const next = cloneDate(opening)
  next.setDate(next.getDate() + 7)
  return next
}
