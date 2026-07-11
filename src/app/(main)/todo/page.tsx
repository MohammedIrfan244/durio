import TodoAPP from '@/components/pages/todo/todo'
import { APP_NAME } from '@/lib/brand'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: `My To-Dos - ${APP_NAME}`,
  description:
    `Manage your daily tasks and stay on top of deadlines with ${APP_NAME}'s To-Do feature. Track pending, active, and completed tasks.`,
  openGraph: {
    title: `My To-Dos - ${APP_NAME}`,
    description: "Plan, track, and complete your daily tasks with ease.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `My To-Dos - ${APP_NAME}`,
    description: "Plan, track, and complete your daily tasks with ease.",
  },
}


function TodoPage() {
  return (
    <TodoAPP />
  )
}

export default TodoPage