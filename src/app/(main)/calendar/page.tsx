import React from 'react'
import Calendar from '@/components/pages/calendar/calendar'
import { APP_NAME } from '@/lib/brand'

export const metadata = {
    title: `${APP_NAME} - Calendar`,
    description: "Time to plan your days",
}

function CalendarPage() {
  return (
    <Calendar />
  )
}

export default CalendarPage