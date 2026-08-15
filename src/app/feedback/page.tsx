import React from 'react'
import { APP_NAME } from '@/lib/brand'
import FeedbackClient from '../../components/pages/static-pages/feedback-client'

export const metadata = {
    title: `${APP_NAME} - Feedback`,
    description: "Help us improve your experience",
}

export default function FeedbackPage() {
  return (
    <FeedbackClient />
  )
}
