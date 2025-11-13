import { INVITE_WINDOW_END, LIST_OPEN_TIME } from '../rules/functional-rules'

const cloneDate = (date: Date): Date => new Date(date.getTime())

export const getCurrentWeekListOpening = (now: Date = new Date()): Date => {
  const result = cloneDate(now)
  const currentDay = result.getDay()
  const daysSinceOpening = (currentDay - LIST_OPEN_TIME.dayOfWeek + 7) % 7

  result.setDate(result.getDate() - daysSinceOpening)
  result.setHours(LIST_OPEN_TIME.hour, LIST_OPEN_TIME.minute, 0, 0)

  return result
}

export const getListClosingFromOpening = (opening: Date): Date => {
  const closing = cloneDate(opening)
  const dayOffset =
    (INVITE_WINDOW_END.dayOfWeek - LIST_OPEN_TIME.dayOfWeek + 7) % 7

  closing.setDate(closing.getDate() + dayOffset)
  closing.setHours(INVITE_WINDOW_END.hour, INVITE_WINDOW_END.minute, 0, 0)

  return closing
}

export const getNextWeekListOpening = (opening: Date): Date => {
  const next = cloneDate(opening)
  next.setDate(next.getDate() + 7)
  return next
}
