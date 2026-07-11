import React from 'react'
import Notes from '@/components/pages/note/note'
import { APP_NAME } from '@/lib/brand'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `My Notes - ${APP_NAME}`,
  description:
    "Capture, organize, and revisit your thoughts and ideas. Your personal knowledge base in DURIO.",
  openGraph: {
    title: `My Notes - ${APP_NAME}`,
    description: "Capture and organize your thoughts and ideas with ease.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `My Notes - ${APP_NAME}`,
    description: "Capture and organize your thoughts and ideas with ease.",
  },
}


function NotePage() {
  return (
    <Notes />
  )
}

export default NotePage