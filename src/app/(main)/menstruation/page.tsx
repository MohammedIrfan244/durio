import Menstruation from '@/components/pages/menstruation/menstruation'
import React from 'react'
import { APP_NAME } from '@/lib/brand'

export const metadata = {
    title: ` Menstruation - ${APP_NAME}`,
    description: "Track your menstrual cycle",
}

function MenstruationPage() {
  return (
    <Menstruation/>
  )
}

export default MenstruationPage
