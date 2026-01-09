import Workout from '@/components/pages/workout/workout'
import React from 'react'
import { APP_NAME } from '@/lib/brand'

export const metadata = {
    title: `${APP_NAME} - Workout`,
    description: "Count your calories",
}

function WorkoutPage() {
  return (
    <Workout />
  )
}

export default WorkoutPage