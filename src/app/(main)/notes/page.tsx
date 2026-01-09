import React from 'react'
import Notes from '@/components/pages/note/note'
import { APP_NAME } from '@/lib/brand'

export const metadata = {
  title: `Notes - ${APP_NAME}`,
  description: 'Manage your thoughts and ideas with ease.',
}

function NotePage() {
  return (
    <Notes />
  )
}

export default NotePage