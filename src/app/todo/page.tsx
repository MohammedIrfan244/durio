import TodoAPP from '@/components/pages/todo/todo'
import { APP_NAME } from '@/lib/brand'
import React from 'react'

export const metadata = {
  title: `To-Do - ${APP_NAME}`,
  description: `Manage your daily tasks and stay organized with ${APP_NAME}\'s To-Do feature.`,
}

function TodoPage() {
  return (
    <TodoAPP />
  )
}

export default TodoPage